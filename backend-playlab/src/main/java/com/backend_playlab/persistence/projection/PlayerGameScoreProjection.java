package com.backend_playlab.persistence.projection;

public interface PlayerGameScoreProjection {
    Long getGameId();
    String getGameName();
    Long getTotalScore();
    Long getBestScore();
}
