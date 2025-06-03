package com.finki.intellicard.service;

import com.finki.intellicard.record.Document;
import com.finki.intellicard.record.GeneratedCardDto;
import com.finki.intellicard.record.GenerateQuestionsRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
public class QuestionGenerationService {
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private static final Set<String> activeRequests = ConcurrentHashMap.newKeySet();

    @Value("${openai.api.url:https://api.openai.com/v1/chat/completions}")
    private String openaiApiUrl;

    @Value("${openai.api.key:}")
    private String openaiApiKey;

    @Value("${openai.model:gpt-3.5-turbo}")
    private String model;

    @Value("${openai.temperature:0.7}")
    private double temperature;

    @Value("${openai.max-tokens:2500}")
    private int maxTokens;

    public QuestionGenerationService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        this.objectMapper = new ObjectMapper();
    }

    public List<GeneratedCardDto> generateCardsFromDocument(Document document, GenerateQuestionsRequest request) {
        String requestId = document.getTitle() + "_" + System.currentTimeMillis() + "_" +
                request.getQuestionCount() + "_" + request.getDifficultyLevel();

        if (activeRequests.contains(requestId)) {
            return List.of();
        }

        activeRequests.add(requestId);

        try {
            List<GeneratedCardDto> generatedCards = callAiGenerationApi(document, request);

            if (generatedCards.isEmpty()) {
                return List.of();
            }

            return generatedCards;

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate cards: " + e.getMessage(), e);
        } finally {
            activeRequests.remove(requestId);
        }
    }

    private List<GeneratedCardDto> callAiGenerationApi(Document document, GenerateQuestionsRequest request) {
        try {
            List<GeneratedCardDto> result = callConfiguredAiApi(document, request);
            return result;
        } catch (Exception e) {
            throw new RuntimeException("OpenAI API call failed: " + e.getMessage(), e);
        }
    }

    private boolean isO1Model() {
        return model != null && (model.startsWith("o1") || model.startsWith("o4"));
    }

    private List<GeneratedCardDto> callConfiguredAiApi(Document document, GenerateQuestionsRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        if (openaiApiKey != null && !openaiApiKey.isEmpty()) {
            headers.set("Authorization", "Bearer " + openaiApiKey);
        }

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);


        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", "You are an educational flashcard generator that creates precise, well-formatted JSON output."));
        messages.add(Map.of("role", "user", "content", buildPrompt(document, request)));
        requestBody.put("messages", messages);
        requestBody.put("temperature", temperature);
        requestBody.put("max_tokens", maxTokens);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(openaiApiUrl, entity, Map.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("OpenAI API returned error: " + response.getStatusCode());
            }

            String aiResponse = extractContentFromAiResponse(response.getBody());
            List<GeneratedCardDto> cards = parseCardsFromAiResponse(aiResponse);

            return cards;

        } catch (Exception e) {
            throw new RuntimeException("OpenAI API call failed: " + e.getMessage(), e);
        }
    }

    private String buildPrompt(Document document, GenerateQuestionsRequest request) {
        String language = (request.getLanguage() != null && !request.getLanguage().isEmpty())
                ? request.getLanguage() : "English";

        String difficultyInstructions = getDifficultyInstructions(request.getDifficultyLevel());

        return String.format("""
        You are an expert educational content creator specializing in flashcard generation.
        
        TASK:
        Generate exactly %d flashcards in %s language based on the educational content below.
        
        DIFFICULTY: %s
        REQUIREMENTS:
        - Each flashcard should have a clear, specific term/question and comprehensive definition/answer
        - Focus on key concepts and important facts from the content
        - %s
        - Must keep both terms and definitions comprehensive but under 250 characters
        - Terms should be specific and unambiguous
        - Questions should be directly based on the document content
        
        OUTPUT FORMAT:
        Return ONLY a valid JSON array with this exact structure:
        [
          {
            "term": "Clear, specific question or term",
            "definition": "Comprehensive answer or definition"
          }
        ]
        
        CRITICAL: Return ONLY the JSON array, no explanations, no additional text, no markdown formatting.
        
        EDUCATIONAL CONTENT:
        %s
        """,
                request.getQuestionCount(),
                language,
                request.getDifficultyLevel(),
                difficultyInstructions,
                document.getContent()
        );
    }

    private String getDifficultyInstructions(String difficulty) {
        return switch (difficulty.toUpperCase()) {
            case "EASY" -> "Create basic questions that test fundamental understanding and recall";
            case "MEDIUM" -> "Create intermediate questions that test comprehension and application";
            case "HARD" -> "Create advanced questions that test analysis, synthesis, and evaluation";
            case "MIXED" -> "Create a mix of easy, medium, and hard questions";
            default -> "Create intermediate questions that test comprehension and application";
        };
    }

    private String extractContentFromAiResponse(Map<String, Object> responseBody) {
        try {
            if (responseBody == null) {
                return "{}";
            }

            if (responseBody.containsKey("choices")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> firstChoice = choices.get(0);
                    if (firstChoice.containsKey("message")) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
                        return (String) message.get("content");
                    } else if (firstChoice.containsKey("text")) {
                        return (String) firstChoice.get("text");
                    }
                }
            }

            if (responseBody.containsKey("generated_text")) {
                return (String) responseBody.get("generated_text");
            }

            for (Object key : responseBody.keySet()) {
                Object value = responseBody.get(key);
                if (value instanceof String) {
                    return (String) value;
                }
            }

            return objectMapper.writeValueAsString(responseBody);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse OpenAI response", e);
        }
    }

    private List<GeneratedCardDto> parseCardsFromAiResponse(String aiResponse) {
        try {
            String jsonContent = extractJsonFromText(aiResponse);

            JsonNode jsonNode = objectMapper.readTree(jsonContent);

            JsonNode jsonArray;
            if (jsonNode.isArray()) {
                jsonArray = jsonNode;
            } else if (jsonNode.isObject()) {
                ArrayNode arrayNode = objectMapper.createArrayNode();
                arrayNode.add(jsonNode);
                jsonArray = arrayNode;
            } else {
                throw new RuntimeException("Response is not a valid JSON array or object");
            }

            List<GeneratedCardDto> cards = StreamSupport.stream(jsonArray.spliterator(), false)
                    .map(this::convertJsonNodeToCardDto)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            return cards;

        } catch (Exception e) {
            throw new RuntimeException("Failed to parse generated cards: " + e.getMessage(), e);
        }
    }

    private GeneratedCardDto convertJsonNodeToCardDto(JsonNode cardNode) {
        try {
            String term = null;
            if (cardNode.has("term")) {
                term = cardNode.get("term").asText();
            } else if (cardNode.has("question")) {
                term = cardNode.get("question").asText();
            } else if (cardNode.has("text")) {
                term = cardNode.get("text").asText();
            }

            String definition = null;
            if (cardNode.has("definition")) {
                definition = cardNode.get("definition").asText();
            } else if (cardNode.has("answer")) {
                definition = cardNode.get("answer").asText();
            } else if (cardNode.has("explanation")) {
                definition = cardNode.get("explanation").asText();
            }

            if (term == null || term.trim().isEmpty() ||
                    definition == null || definition.trim().isEmpty()) {
                return null;
            }

            if (definition.trim().length() < 10) {
                return null;
            }

            return new GeneratedCardDto(term.trim(), definition.trim());

        } catch (Exception e) {
            return null;
        }
    }

    private String extractJsonFromText(String text) {
        if (text == null || text.trim().isEmpty()) {
            return "[]";
        }

        int startIndex = text.indexOf("[");
        int endIndex = text.lastIndexOf("]");

        if (startIndex != -1 && endIndex != -1 && endIndex > startIndex) {
            return text.substring(startIndex, endIndex + 1);
        }

        startIndex = text.indexOf("{");
        endIndex = text.lastIndexOf("}");

        if (startIndex != -1 && endIndex != -1 && endIndex > startIndex) {
            return text.substring(startIndex, endIndex + 1);
        }

        return "[]";
    }
}