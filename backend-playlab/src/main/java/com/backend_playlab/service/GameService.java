package com.backend_playlab.service;

import com.backend_playlab.controller.dto.game.GameResponse;
import com.backend_playlab.exception.ResourceNotFoundException;
import com.backend_playlab.persistence.entity.GameEntity;
import com.backend_playlab.persistence.repository.GameRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class GameService {

    private final GameRepository gameRepository;

    public GameService(GameRepository gameRepository) {
        this.gameRepository = gameRepository;
    }

    @Transactional(readOnly = true)
    public List<GameResponse> listGames() {
        return gameRepository.findAll(Sort.by(Sort.Direction.ASC, "name")).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public GameResponse getGame(Long id) {
        GameEntity entity = gameRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found"));
        return mapToResponse(entity);
    }

    private GameResponse mapToResponse(GameEntity entity) {
        return new GameResponse(entity.getId(), entity.getName(), entity.getCode(), entity.getDescription());
    }
}
