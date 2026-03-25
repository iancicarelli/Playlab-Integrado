package com.backend_playlab.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Setter
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "permission")
public class PermissionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "permission_name", unique = true, nullable = false, updatable = false)
    @Enumerated(EnumType.STRING)
    private PermissionEnum permissionName;

    @ManyToMany(mappedBy = "permissionEntities", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private Set<RoleEntity> roleEntities = new HashSet<>();

}
