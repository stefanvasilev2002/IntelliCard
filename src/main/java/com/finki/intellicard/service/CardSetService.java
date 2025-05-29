package com.finki.intellicard.service;

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
        String username = myUserDetailsService.getUsername();
        Long currentUserId = myUserDetailsService.getUserIdByUsername(username);

        return cardSetRepository.findPublicAndAccessibleCardset(cardSetId, currentUserId)
                .orElseThrow(() -> new RuntimeException("CardSet not found or access denied"));
    }

    public CardSetRecord createCardSet(CardSetRecord cardSetRecord) {
        UserRecord creatorRecord = userRepository.findUserRecordByUsername(myUserDetailsService.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        User creator = new User();
        creator.setId(creatorRecord.id());

        CardSet cardSet = CardSet.builder()
                .name(cardSetRecord.name())
                .isPublic(cardSetRecord.isPublic())
                .creator(creator)
                .createdAt(LocalDateTime.now())
                .lastModified(LocalDateTime.now())
                .build();

        return convertCardSetToRecord(cardSetRepository.save(cardSet), null);
    }

    public void deleteCardSet(Long id) {
        CardSet cardSet = findCardSetByIdAndVerifyOwner(id);
        cardSetRepository.delete(cardSet);
    }

    public CardSetRecord updateCardSet(Long id, CardSetRecord cardSetRecord) {
        CardSet cardSet = findCardSetByIdAndVerifyOwner(id);

        cardSet.setName(cardSetRecord.name());
        cardSet.setPublic(cardSetRecord.isPublic());
        cardSet.setLastModified(LocalDateTime.now());

        return convertCardSetToRecord(cardSetRepository.save(cardSet), cardSetRecord.accessType());
    }

    public CardSet findCardSetByIdAndVerifyOwner(Long id) {
        return cardSetRepository.findByIdAndOwnerUsername(id, myUserDetailsService.getUsername())
                .orElseThrow(() -> new RuntimeException("Access denied or Card Set not found"));
    }

    private CardSetRecord convertCardSetToRecord(CardSet cardSet, String accessType) {
        return new CardSetRecord(
                cardSet.getId(),
                cardSet.getName(),
                cardSet.isPublic(),
                cardSet.getCreator().getId(),
                cardSet.getCreator().getUsername(),
                accessType
        );
    }
}