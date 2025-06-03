package com.finki.intellicard.service;

import com.finki.intellicard.exceptions.CardSetNotFoundException;
import com.finki.intellicard.exceptions.UnauthorizedAccessException;
import com.finki.intellicard.exceptions.UserNotFoundException;
import com.finki.intellicard.model.CardSet;
import com.finki.intellicard.model.User;
import com.finki.intellicard.record.CardSetRecord;
import com.finki.intellicard.record.UserRecord;
import com.finki.intellicard.repository.CardSetRepository;
import com.finki.intellicard.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class CardSetService {

    private final CardSetRepository cardSetRepository;
    private final MyUserDetailsService myUserDetailsService;
    private final UserRepository userRepository;

    public CardSetService(CardSetRepository cardSetRepository,
                          MyUserDetailsService myUserDetailsService,
                          UserRepository userRepository) {
        this.cardSetRepository = cardSetRepository;
        this.myUserDetailsService = myUserDetailsService;
        this.userRepository = userRepository;
    }

    public List<CardSetRecord> getAllCardSets() {
        String username = myUserDetailsService.getUsername();
        Long currentUserId = myUserDetailsService.getUserIdByUsername(username);

        return cardSetRepository.findAllPublicAndAccessibleCardsets(currentUserId);
    }

    public CardSetRecord getCardSetById(Long cardSetId) {
        CardSet cardSet = cardSetRepository.findById(cardSetId)
                .orElseThrow(() -> new CardSetNotFoundException("CardSet not found"));

        verifyCardSetAccess(cardSet);

        String username = myUserDetailsService.getUsername();
        Long currentUserId = myUserDetailsService.getUserIdByUsername(username);

        String accessType = determineAccessType(cardSet, currentUserId);

        return convertCardSetToRecord(cardSet, accessType);
    }

    public CardSetRecord createCardSet(CardSetRecord cardSetRecord) {
        UserRecord creatorRecord = userRepository.findUserRecordByUsername(myUserDetailsService.getUsername())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        User creator = User.builder()
                .id(creatorRecord.id())
                .username(creatorRecord.username())
                .fullName(creatorRecord.fullName())
                .build();

        CardSet cardSet = CardSet.builder()
                .name(cardSetRecord.name())
                .isPublic(cardSetRecord.isPublic())
                .creator(creator)
                .createdAt(LocalDateTime.now())
                .lastModified(LocalDateTime.now())
                .build();

        CardSet savedCardSet = cardSetRepository.save(cardSet);
        return convertCardSetToRecord(savedCardSet, "OWNER");
    }

    public void deleteCardSet(Long id) {
        CardSet cardSet = cardSetRepository.findById(id)
                .orElseThrow(() -> new CardSetNotFoundException("CardSet not found"));

        verifyCardSetOwnership(cardSet);

        cardSetRepository.delete(cardSet);
    }

    public CardSetRecord updateCardSet(Long id, CardSetRecord cardSetRecord) {
        CardSet cardSet = cardSetRepository.findById(id)
                .orElseThrow(() -> new CardSetNotFoundException("CardSet not found"));

        verifyCardSetOwnership(cardSet);

        cardSet.setName(cardSetRecord.name());
        cardSet.setPublic(cardSetRecord.isPublic());
        cardSet.setLastModified(LocalDateTime.now());

        CardSet updatedCardSet = cardSetRepository.save(cardSet);
        return convertCardSetToRecord(updatedCardSet, "OWNER");
    }

    private void verifyCardSetOwnership(CardSet cardSet) {
        String currentUsername = myUserDetailsService.getUsername();
        if (!cardSet.getCreator().getUsername().equals(currentUsername)) {
            throw new UnauthorizedAccessException("You are not authorized to perform this action on this card set");
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

    private String determineAccessType(CardSet cardSet, Long currentUserId) {
        if (cardSet.getCreator().getId().equals(currentUserId)) {
            return "OWNER";
        } else if (cardSet.getApprovedUsers().stream().anyMatch(user -> user.getId().equals(currentUserId))) {
            return "ACCESSIBLE";
        } else if (cardSet.isPublic()) {
            return "PUBLIC";
        } else {
            return "NO_ACCESS";
        }
    }

    private CardSetRecord convertCardSetToRecord(CardSet cardSet, String accessType) {
        return new CardSetRecord(
                cardSet.getId(),
                cardSet.getName(),
                cardSet.isPublic(),
                cardSet.getCreator().getId(),
                cardSet.getCreator().getUsername(),
                accessType,
                cardSet.getCards() == null ? 0 : cardSet.getCards().size()
        );
    }
}