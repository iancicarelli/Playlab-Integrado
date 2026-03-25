package com.backend_playlab.service;

import com.backend_playlab.controller.dto.score.ScoreRecordResponse;
import com.backend_playlab.controller.dto.score.ScoreSubmissionRequest;
import com.backend_playlab.controller.dto.score.ScoreboardResponse;
import com.backend_playlab.exception.ForbiddenActionException;
import com.backend_playlab.exception.ResourceNotFoundException;
import com.backend_playlab.persistence.entity.GameEntity;
import com.backend_playlab.persistence.entity.ScoreEntity;
import com.backend_playlab.persistence.entity.UserEntity;
import com.backend_playlab.persistence.repository.GameRepository;
import com.backend_playlab.persistence.repository.ScoreRepository;
import com.backend_playlab.persistence.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
public class ScoreService {

    private final ScoreRepository scoreRepository;
    private final UserRepository userRepository;
    private final GameRepository gameRepository;

    public ScoreService(ScoreRepository scoreRepository,
                        UserRepository userRepository,
                        GameRepository gameRepository) {
        this.scoreRepository = scoreRepository;
        this.userRepository = userRepository;
        this.gameRepository = gameRepository;
    }

    @Transactional
    public ScoreRecordResponse submitScore(ScoreSubmissionRequest request, String authenticatedUsername) {
        if (authenticatedUsername == null) {
            throw new ForbiddenActionException("Authentication is required to submit scores");
        }

        UserEntity user = userRepository.findUserByUsername(authenticatedUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found"));

        GameEntity game = gameRepository.findById(request.gameId())
                .orElseThrow(() -> new ResourceNotFoundException("Game not found"));

        ScoreEntity entity = ScoreEntity.builder()
                .user(user)
                .game(game)
                .score(request.score())
                .build();

        ScoreEntity saved = scoreRepository.save(entity);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public ScoreRecordResponse getScoreForPlayerAndGame(Long playerId, Long gameId) {
        ScoreEntity entity = scoreRepository.findFirstByUser_IdAndGame_IdOrderByScoreDescCreatedAtDesc(playerId, gameId)
                .orElseThrow(() -> new ResourceNotFoundException("Score not found for player and game"));
        return mapToResponse(entity);
    }

    @Transactional(readOnly = true)
    public ScoreboardResponse getLeaderboardForGame(Long gameId) {
        GameEntity game = gameRepository.findById(gameId)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found"));

        List<ScoreEntity> entries = scoreRepository.findByGame_IdOrderByScoreDescCreatedAtAsc(gameId);
        if (entries.isEmpty()) {
            throw new ResourceNotFoundException("No scores registered for this game yet");
        }

        List<ScoreRecordResponse> responses = entries.stream().map(this::mapToResponse).toList();
        return new ScoreboardResponse(game.getId(), game.getName(), responses);
    }

    @Transactional(readOnly = true)
    public ScoreboardResponse getTopScoresForGame(Long gameId, int limit) {
        int sanitizedLimit = limit > 0 ? Math.min(limit, 50) : 15;

        GameEntity game = gameRepository.findById(gameId)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found"));

        List<ScoreEntity> entries = scoreRepository.findByGame_IdOrderByScoreDescCreatedAtAsc(gameId, PageRequest.of(0, sanitizedLimit));
        if (entries.isEmpty()) {
            throw new ResourceNotFoundException("No scores registered for this game yet");
        }

        List<ScoreRecordResponse> responses = entries.stream().map(this::mapToResponse).toList();
        return new ScoreboardResponse(game.getId(), game.getName(), responses);
    }

    private ScoreRecordResponse mapToResponse(ScoreEntity entity) {
        return new ScoreRecordResponse(
                entity.getId(),
                entity.getUser().getId(),
                entity.getUser().getUsername(),
                entity.getGame().getId(),
                entity.getGame().getName(),
                entity.getScore(),
                entity.getCreatedAt()
        );
    }
}
