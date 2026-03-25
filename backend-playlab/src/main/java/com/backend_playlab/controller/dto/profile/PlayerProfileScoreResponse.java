package com.backend_playlab.controller.dto.profile;

public record PlayerProfileScoreResponse(
        Long gameId,
        String gameName,
        Long totalScore,
        Long bestScore
) {
}
