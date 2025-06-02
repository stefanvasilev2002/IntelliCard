package com.finki.intellicard.service;

import com.finki.intellicard.exceptions.CardNotFoundException;
import com.finki.intellicard.exceptions.CardSetNotFoundException;
import com.finki.intellicard.exceptions.UnauthorizedAccessException;
import com.finki.intellicard.model.Card;
import com.finki.intellicard.model.CardSet;
import com.finki.intellicard.model.User;
import com.finki.intellicard.model.UserCardProgress;
import com.finki.intellicard.model.enums.CardStatus;
import com.finki.intellicard.record.CardRecord;
import com.finki.intellicard.record.StudySessionRecord;
import com.finki.intellicard.repository.CardRepository;
import com.finki.intellicard.repository.CardSetRepository;
import com.finki.intellicard.repository.UserCardProgressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SpacedRepetitionService {

    private final UserCardProgressRepository userCardProgressRepository;
    private final CardRepository cardRepository;
    private final CardSetRepository cardSetRepository;
    private final MyUserDetailsService myUserDetailsService;

    public SpacedRepetitionService(UserCardProgressRepository userCardProgressRepository, CardRepository cardRepository, CardSetRepository cardSetRepository, MyUserDetailsService myUserDetailsService) {
        this.userCardProgressRepository = userCardProgressRepository;
        this.cardRepository = cardRepository;
        this.cardSetRepository = cardSetRepository;
        this.myUserDetailsService = myUserDetailsService;
    }

    @Transactional
    public void reviewCard(Long cardId, boolean correct, int difficulty) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new CardNotFoundException("Card not found"));

        verifyCardSetAccess(card.getCardSet());

        Long currentUserId = myUserDetailsService.getUserIdByUsername(myUserDetailsService.getUsername());

        UserCardProgress progress = userCardProgressRepository
                .findByUserIdAndCardId(currentUserId, cardId)
                .orElse(UserCardProgress.builder()
                        .user(User.builder().id(currentUserId).build())
                        .card(card)
                        .build());

        updateCardProgress(progress, correct, difficulty);
        userCardProgressRepository.save(progress);
    }

    public List<CardRecord> getDueCardsForReview(Long cardSetId) {
        CardSet cardSet = cardSetRepository.findById(cardSetId)
                .orElseThrow(() -> new CardSetNotFoundException("CardSet not found"));

        verifyCardSetAccess(cardSet);

        Long currentUserId = myUserDetailsService.getUserIdByUsername(myUserDetailsService.getUsername());

        return userCardProgressRepository.findDueCardsForUser(currentUserId, cardSetId, LocalDateTime.now())
                .stream()
                .map(progress -> convertToRecord(progress.getCard(), progress))
                .collect(Collectors.toList());
    }

    public StudySessionRecord getStudyOverview(Long cardSetId) {
        CardSet cardSet = cardSetRepository.findById(cardSetId)
                .orElseThrow(() -> new CardSetNotFoundException("CardSet not found"));

        verifyCardSetAccess(cardSet);

        Long currentUserId = myUserDetailsService.getUserIdByUsername(myUserDetailsService.getUsername());

        int totalCards = userCardProgressRepository.countTotalCardsInSet(cardSetId);
        int dueCards = userCardProgressRepository.countDueCardsForUser(currentUserId, cardSetId, LocalDateTime.now());
        int masteredCards = userCardProgressRepository.countCardsByStatusForUser(currentUserId, cardSetId, CardStatus.MASTERED);
        int learningCards = userCardProgressRepository.countCardsByStatusForUser(currentUserId, cardSetId, CardStatus.LEARNING);

        return new StudySessionRecord(cardSetId, cardSet.getName(), totalCards, dueCards, masteredCards, learningCards);
    }

    private void updateCardProgress(UserCardProgress progress, boolean correct, int difficulty) {
        progress.setTimesReviewed(progress.getTimesReviewed() + 1);
        progress.setLastReviewed(LocalDateTime.now());

        if (correct) {
            progress.setTimesCorrect(progress.getTimesCorrect() + 1);
            progress.setConsecutiveCorrect(progress.getConsecutiveCorrect() + 1);

            double easeFactor = Math.max(1.3, progress.getEaseFactor() + (0.1 - (5 - difficulty) * (0.08 + (5 - difficulty) * 0.02)));
            progress.setEaseFactor(easeFactor);

            if (progress.getConsecutiveCorrect() == 1) {
                progress.setInterval(1);
            } else if (progress.getConsecutiveCorrect() == 2) {
                progress.setInterval(6);
            } else {
                progress.setInterval((int) Math.round(progress.getInterval() * easeFactor));
            }

            progress.setNextReviewDate(LocalDateTime.now().plusDays(progress.getInterval()));

            if (progress.getConsecutiveCorrect() >= 5) {
                progress.setStatus(CardStatus.MASTERED);
            } else if (progress.getConsecutiveCorrect() >= 2) {
                progress.setStatus(CardStatus.REVIEW);
            } else {
                progress.setStatus(CardStatus.LEARNING);
            }
        } else {
            progress.setConsecutiveCorrect(0);
            progress.setInterval(1);
            progress.setNextReviewDate(LocalDateTime.now().plusDays(1));
            progress.setStatus(CardStatus.LEARNING);
        }
    }

    private void verifyCardSetAccess(CardSet cardSet) {
        String currentUsername = myUserDetailsService.getUsername();
        Long currentUserId = myUserDetailsService.getUserIdByUsername(currentUsername);

        boolean hasAccess = cardSet.getCreator().getId().equals(currentUserId) ||
                cardSet.isPublic() ||
                cardSet.getApprovedUsers().stream().anyMatch(user -> user.getId().equals(currentUserId));

        if (!hasAccess) {
            throw new UnauthorizedAccessException("You are not authorized to access this card set");
        }
    }

    private CardRecord convertToRecord(Card card, UserCardProgress progress) {
        return new CardRecord(
                card.getId(),
                card.getTerm(),
                card.getDefinition(),
                progress != null ? progress.getTimesReviewed() : 0,
                progress != null ? progress.getTimesCorrect() : 0,
                progress != null ? progress.getNextReviewDate() : LocalDateTime.now().plusDays(1),
                progress != null ? progress.getStatus().toString() : "NEW"
        );
    }
}