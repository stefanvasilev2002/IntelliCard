package com.finki.intellicard.service;

import com.finki.intellicard.exceptions.CardNotFoundException;
import com.finki.intellicard.exceptions.CardSetNotFoundException;
import com.finki.intellicard.exceptions.UnauthorizedAccessException;
import com.finki.intellicard.exceptions.UserNotFoundException;
import jakarta.transaction.Transactional;
import com.finki.intellicard.model.AccessRequest;
import com.finki.intellicard.model.CardSet;
import com.finki.intellicard.model.User;
import com.finki.intellicard.model.enums.AccessRequestStatus;
import com.finki.intellicard.record.AccessRequestRecord;
import com.finki.intellicard.record.Response;
import com.finki.intellicard.record.UserRecord;
import com.finki.intellicard.repository.AccessRequestRepository;
import com.finki.intellicard.repository.CardSetRepository;
import com.finki.intellicard.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AccessRequestService {

    private final AccessRequestRepository accessRequestRepository;
    private final CardSetRepository cardSetRepository;
    private final UserRepository userRepository;
    private final MyUserDetailsService myUserDetailsService;

    public AccessRequestService(AccessRequestRepository accessRequestRepository,
                                CardSetRepository cardSetRepository,
                                UserRepository userRepository,
                                MyUserDetailsService myUserDetailsService) {
        this.accessRequestRepository = accessRequestRepository;
        this.cardSetRepository = cardSetRepository;
        this.userRepository = userRepository;
        this.myUserDetailsService = myUserDetailsService;
    }

    public Response requestAccess(Long cardSetId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        UserRecord requester = userRepository.findUserRecordByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        User user = new User();
        user.setId(requester.id());

        CardSet cardSet = cardSetRepository.findById(cardSetId)
                .orElseThrow(() -> new CardSetNotFoundException("Card set not found"));

        if (cardSet.getCreator().getId().equals(requester.id())) {
            return new Response("message", "You are the creator of this card set.");
        }

        if (cardSet.getApprovedUsers().stream().anyMatch(u -> u.getId().equals(requester.id()))) {
            return new Response("message", "You already have access to this card set.");
        }

        Optional<AccessRequest> existingRequest = accessRequestRepository
                .findByCardSetIdAndRequesterId(cardSetId, requester.id());

        if (existingRequest.isPresent()) {
            AccessRequest request = existingRequest.get();
            if (request.getStatus() == AccessRequestStatus.PENDING) {
                return new Response("message", "You already have a pending request for this card set.");
            } else if (request.getStatus() == AccessRequestStatus.REJECTED) {
                request.setStatus(AccessRequestStatus.PENDING);
                accessRequestRepository.save(request);
                return new Response("message", "Request sent successfully!");
            }
        }

        AccessRequest request = new AccessRequest();
        request.setRequester(user);
        request.setCardSet(cardSet);
        request.setStatus(AccessRequestStatus.PENDING);
        accessRequestRepository.save(request);

        return new Response("message", "Request sent successfully!");
    }

    @Transactional
    public Response respondToRequest(Long cardSetId, Long requestId, boolean approve) {
        AccessRequest request = accessRequestRepository.findById(requestId)
                .orElseThrow(() -> new UnauthorizedAccessException("Access request not found"));

        if (!request.getCardSet().getId().equals(cardSetId)) {
            throw new CardSetNotFoundException("Invalid cardSetId for the given request");
        }

        String username = myUserDetailsService.getUsername();
        Long requesterId = myUserDetailsService.getUserIdByUsername(username);

        if (!request.getCardSet().getCreator().getId().equals(requesterId)) {
            throw new UnauthorizedAccessException("You are not authorized to respond to this request");
        }

        if (approve) {
            request.setStatus(AccessRequestStatus.APPROVED);
            cardSetRepository.addApprovedUser(cardSetId, request.getRequester().getId());
            accessRequestRepository.delete(request);
        } else {
            request.setStatus(AccessRequestStatus.REJECTED);
            accessRequestRepository.save(request);
        }

        return new Response("message", "Request has been " + (approve ? "approved" : "rejected"));
    }

    public List<AccessRequestRecord> getPendingRequests(Long cardsetId) {
        String creatorUsername = cardSetRepository.findOwnerUsernameByCardSetId(cardsetId)
                .orElseThrow(() -> new CardNotFoundException("Card Set not found"));

        String username = myUserDetailsService.getUsername();
        if (!creatorUsername.equals(username)) {
            throw new UnauthorizedAccessException("You are not authorized to view these requests");
        }

        return accessRequestRepository.findByCardSetIdAndStatus(cardsetId, AccessRequestStatus.PENDING)
                .stream()
                .map(this::convertToRecord)
                .collect(Collectors.toList());
    }

    private AccessRequestRecord convertToRecord(AccessRequest request) {
        return new AccessRequestRecord(
                request.getId(),
                request.getCardSet().getId(),
                request.getCardSet().getName(),
                request.getRequester().getId(),
                request.getRequester().getUsername(),
                request.getStatus().toString()
        );
    }
}