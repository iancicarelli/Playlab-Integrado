package com.backend_playlab.controller;

import com.backend_playlab.controller.dto.profile.PlayerProfileResponse;
import com.backend_playlab.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ResponseEntity<PlayerProfileResponse> getProfile(@RequestParam Long playerId) {
        return ResponseEntity.ok(profileService.getProfile(playerId));
    }
}
