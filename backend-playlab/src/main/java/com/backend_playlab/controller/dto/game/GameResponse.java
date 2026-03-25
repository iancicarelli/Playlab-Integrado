package com.backend_playlab.controller.dto.game;

public record GameResponse(
        Long id,
        String name,
        String code,
        String description
) {
}
