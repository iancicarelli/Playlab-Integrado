package com.backend_playlab.controller;

import com.backend_playlab.controller.dto.score.ScoreRecordResponse;
import com.backend_playlab.controller.dto.score.ScoreSubmissionRequest;
import com.backend_playlab.controller.dto.score.ScoreboardResponse;
import com.backend_playlab.service.ScoreService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/scores")
@CrossOrigin(origins = "*")
public class ScoreController {

    private final ScoreService scoreService;

    public ScoreController(ScoreService scoreService) {
        this.scoreService = scoreService;
    }

    @GetMapping
    public ResponseEntity<?> getScores(@RequestParam Long gameId,
                                       @RequestParam(required = false) Long playerId) {
        if (playerId != null) {
            ScoreRecordResponse response = scoreService.getScoreForPlayerAndGame(playerId, gameId);
            return ResponseEntity.ok(response);
        }
        ScoreboardResponse response = scoreService.getLeaderboardForGame(gameId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<ScoreboardResponse> getTopScores(@RequestParam Long gameId,
                                                           @RequestParam(name = "limit", defaultValue = "15") int limit) {
        return ResponseEntity.ok(scoreService.getTopScoresForGame(gameId, limit));
    }

    @PostMapping
    public ResponseEntity<ScoreRecordResponse> submitScore(@Valid @RequestBody ScoreSubmissionRequest request,
                                                           Authentication authentication) {
        ScoreRecordResponse response = scoreService.submitScore(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
