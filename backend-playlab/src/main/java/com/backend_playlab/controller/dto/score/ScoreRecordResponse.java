package com.backend_playlab.controller.dto.score;

import java.time.LocalDateTime;

public record ScoreRecordResponse(
        Long id,
        Long playerId,
        String username,
        Long gameId,
        String gameName,
        Long score,
        LocalDateTime recordedAt
) {
}
