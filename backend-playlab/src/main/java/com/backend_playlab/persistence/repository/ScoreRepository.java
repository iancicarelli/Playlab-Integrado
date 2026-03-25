package com.backend_playlab.persistence.repository;

import com.backend_playlab.persistence.entity.ScoreEntity;
import com.backend_playlab.persistence.projection.PlayerGameScoreProjection;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScoreRepository extends JpaRepository<ScoreEntity, Long> {

    Optional<ScoreEntity> findFirstByUser_IdAndGame_IdOrderByScoreDescCreatedAtDesc(Long userId, Long gameId);

    List<ScoreEntity> findByGame_IdOrderByScoreDescCreatedAtAsc(Long gameId);

    List<ScoreEntity> findByGame_IdOrderByScoreDescCreatedAtAsc(Long gameId, Pageable pageable);

    @Query("""
            SELECT s.game.id AS gameId,
                   s.game.name AS gameName,
                   SUM(s.score) AS totalScore,
                   MAX(s.score) AS bestScore
            FROM ScoreEntity s
            WHERE s.user.id = :userId
            GROUP BY s.game.id, s.game.name
            ORDER BY MAX(s.score) DESC
            """)
    List<PlayerGameScoreProjection> aggregateScoresByUser(@Param("userId") Long userId);
}
