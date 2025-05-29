package com.finki.intellicard.controller;

import com.finki.intellicard.record.AccessRequestRecord;
import com.finki.intellicard.record.Response;
import com.finki.intellicard.service.AccessRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cardsets/{cardSetId}/access-requests")
@Tag(name = "Access Requests", description = "Endpoints for managing card set access requests")
public class AccessRequestController {

    private final AccessRequestService accessRequestService;

    public AccessRequestController(AccessRequestService accessRequestService) {
        this.accessRequestService = accessRequestService;
    }

    @Operation(summary = "Request access to a card set",
            description = "Submit a request to access a private card set")
    @PostMapping
    public ResponseEntity<Response> requestAccess(
            @Parameter(description = "ID of the card set to request access to")
            @PathVariable Long cardSetId) {
        return ResponseEntity.ok(accessRequestService.requestAccess(cardSetId));
    }

    @Operation(summary = "Get pending access requests",
            description = "Retrieve all pending access requests for a card set (owner only)")
    @GetMapping
    public ResponseEntity<List<AccessRequestRecord>> getPendingRequests(
            @Parameter(description = "ID of the card set")
            @PathVariable Long cardSetId) {
        List<AccessRequestRecord> pendingRequests = accessRequestService.getPendingRequests(cardSetId);
        return ResponseEntity.ok(pendingRequests);
    }

    @Operation(summary = "Respond to access request",
            description = "Approve or reject an access request (owner only)")
    @PutMapping("/{requestId}")
    public ResponseEntity<Response> respondToRequest(
            @Parameter(description = "ID of the card set")
            @PathVariable Long cardSetId,
            @Parameter(description = "ID of the access request")
            @PathVariable Long requestId,
            @Parameter(description = "Whether to approve the request")
            @RequestParam boolean approve) {
        Response response = accessRequestService.respondToRequest(cardSetId, requestId, approve);
        return ResponseEntity.ok(response);
    }
}