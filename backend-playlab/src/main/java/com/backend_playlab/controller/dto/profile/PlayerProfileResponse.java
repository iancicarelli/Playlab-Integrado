package com.backend_playlab.controller.dto.profile;

import java.util.List;

public record PlayerProfileResponse(
        Long playerId,
        String username,
        List<PlayerProfileScoreResponse> scores
) {
}
