package com.backend_playlab.controller.dto.score;

import java.util.List;

public record ScoreboardResponse(
        Long gameId,
        String gameName,
        List<ScoreRecordResponse> entries
) {
}
