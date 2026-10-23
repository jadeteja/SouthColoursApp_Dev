package com.southcolours.catalog.repository;

import com.southcolours.catalog.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    Optional<Product> findBySlug(String slug);

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.isNewArrival = true ORDER BY p.createdAt DESC")
    List<Product> findTopNewArrivals(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.isFeatured = true ORDER BY p.createdAt DESC")
    List<Product> findTopFeatured(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND (p.category.id = :categoryId OR p.category.parent.id = :categoryId)")
    Page<Product> findByCategoryIdOrParentId(@Param("categoryId") Long categoryId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND (p.category.id = :categoryId OR p.category.parent.id = :categoryId) AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> findByCategoryIdOrParentIdAndSearch(@Param("categoryId") Long categoryId, @Param("search") String search, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> findBySearch(@Param("search") String search, Pageable pageable);
}
