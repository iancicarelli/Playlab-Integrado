package com.backend_playlab.controller.dto.score;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ScoreSubmissionRequest(
        Long playerId,
        @NotNull(message = "gameId is required") Long gameId,
        @NotNull(message = "score is required") @Min(value = 0, message = "score must be zero or positive") Long score
) {
}
