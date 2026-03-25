package com.backend_playlab;

import com.backend_playlab.persistence.entity.*;
import com.backend_playlab.persistence.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@SpringBootApplication
public class Application {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

	@Bean
	CommandLineRunner init(UserRepository userRepository){
		return args -> {

			// Permisos del sistema

			PermissionEntity readRanking = PermissionEntity.builder()
					.permissionName(PermissionEnum.READ_RANKING)
					.build();

			// Roles del sistema

			RoleEntity player = RoleEntity.builder()
					.roleName(RoleEnum.PLAYER)
					.permissionEntities(Set.of(readRanking))
					.build();

			// Usuarios del sistema

			UserEntity tester = UserEntity.builder()
					.username("tester")
					.password(new BCryptPasswordEncoder().encode("123"))
					.accountNonExpired(true)
					.accountNonLocked(true)
					.credentialsNonExpired(true)
					.isEnabled(true)
					.roleEntities(Set.of(player))
					.build();

			userRepository.saveAll(List.of(tester));
		};
	}
}
