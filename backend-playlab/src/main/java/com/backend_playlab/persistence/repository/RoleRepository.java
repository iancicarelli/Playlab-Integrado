package com.backend_playlab.persistence.repository;

import com.backend_playlab.persistence.entity.RoleEntity;
import com.backend_playlab.persistence.entity.RoleEnum;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoleRepository extends CrudRepository<RoleEntity, Long> {

    List<RoleEntity> findRolesByRoleNameIn(List<RoleEnum> roleNames);
}
