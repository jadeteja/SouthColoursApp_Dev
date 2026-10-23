package com.southcolours.catalog.repository;

import com.southcolours.catalog.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByParentIsNullAndIsActiveTrueOrderByDisplayOrderAsc();
    List<Category> findByParentIsNullOrderByDisplayOrderAsc();
    List<Category> findByIsActiveTrueOrderByDisplayOrderAsc();
    Optional<Category> findBySlug(String slug);
    Optional<Category> findByName(String name);
    boolean existsBySlug(String slug);
}
