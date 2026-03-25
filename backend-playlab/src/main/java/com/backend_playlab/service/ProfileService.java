package com.backend_playlab.service;

import com.backend_playlab.controller.dto.profile.PlayerProfileResponse;
import com.backend_playlab.controller.dto.profile.PlayerProfileScoreResponse;
import com.backend_playlab.exception.ResourceNotFoundException;
import com.backend_playlab.persistence.entity.UserEntity;
import com.backend_playlab.persistence.projection.PlayerGameScoreProjection;
import com.backend_playlab.persistence.repository.ScoreRepository;
import com.backend_playlab.persistence.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final ScoreRepository scoreRepository;

    public ProfileService(UserRepository userRepository, ScoreRepository scoreRepository) {
        this.userRepository = userRepository;
        this.scoreRepository = scoreRepository;
    }

    @Transactional(readOnly = true)
    public PlayerProfileResponse getProfile(Long playerId) {
        UserEntity user = userRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found"));

        List<PlayerProfileScoreResponse> scores = scoreRepository.aggregateScoresByUser(playerId)
                .stream()
                .map(this::mapScoreProjection)
                .toList();

        return new PlayerProfileResponse(user.getId(), user.getUsername(), scores);
    }

    private PlayerProfileScoreResponse mapScoreProjection(PlayerGameScoreProjection projection) {
        return new PlayerProfileScoreResponse(
                projection.getGameId(),
                projection.getGameName(),
                projection.getTotalScore(),
                projection.getBestScore()
        );
    }
}
