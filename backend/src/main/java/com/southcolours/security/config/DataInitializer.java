package com.southcolours.security.config;

import com.southcolours.catalog.entity.Category;
import com.southcolours.catalog.repository.CategoryRepository;
import com.southcolours.security.entity.Role;
import com.southcolours.security.entity.User;
import com.southcolours.security.repository.RoleRepository;
import com.southcolours.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        // 1. Seed Roles
        Role adminRole = roleRepository.findByName("ROLE_ADMIN").orElseGet(() ->
                roleRepository.save(Role.builder().name("ROLE_ADMIN").description("Administrator").build()));
        Role superAdminRole = roleRepository.findByName("ROLE_SUPER_ADMIN").orElseGet(() ->
                roleRepository.save(Role.builder().name("ROLE_SUPER_ADMIN").description("Super Administrator").build()));
        Role customerRole = roleRepository.findByName("ROLE_CUSTOMER").orElseGet(() ->
                roleRepository.save(Role.builder().name("ROLE_CUSTOMER").description("Customer").build()));

        // 2. Seed Default Admin User
        String adminEmail = "admin@southcolours.com";
        User admin = userRepository.findByEmail(adminEmail).orElse(null);
        if (admin == null) {
            admin = User.builder()
                    .email(adminEmail)
                    .fullName("Store Administrator")
                    .phoneNumber("+91 9876543210")
                    .passwordHash(passwordEncoder.encode("password123"))
                    .roles(new HashSet<>(Arrays.asList(adminRole, superAdminRole, customerRole)))
                    .isActive(true)
                    .build();
            userRepository.save(admin);
            log.info("Default Admin User created: {}", adminEmail);
        } else {
            admin.setPasswordHash(passwordEncoder.encode("password123"));
            admin.getRoles().add(adminRole);
            admin.getRoles().add(superAdminRole);
            admin.setIsActive(true);
            userRepository.save(admin);
            log.info("Default Admin User updated with BCrypt password: {}", adminEmail);
        }

        // 3. Seed Default Categories if empty
        if (categoryRepository.count() == 0) {
            List<CategorySeed> seeds = Arrays.asList(
                    new CategorySeed("Girls", "girls", 1, Arrays.asList("Dresses", "Tops", "Bottoms", "Ethnic Wear")),
                    new CategorySeed("Boys", "boys", 2, Arrays.asList("Ethnic Wear", "T-Shirts", "Shirts", "Shorts", "Sets")),
                    new CategorySeed("Baby Wear", "baby-wear", 3, Arrays.asList("Frocks", "Rompers", "Sets")),
                    new CategorySeed("Ethnic Wear", "ethnic-wear", 4, Arrays.asList("Lehenga Choli", "Anarkali", "Kurta Sets", "Gowns")),
                    new CategorySeed("New Arrivals", "new-arrivals", 5, Arrays.asList("Latest Collections", "Festive Edit")),
                    new CategorySeed("Offers", "offers", 6, Arrays.asList("Season Sale", "Clearance"))
            );

            for (CategorySeed seed : seeds) {
                Category parent = Category.builder()
                        .name(seed.name)
                        .slug(seed.slug)
                        .displayOrder(seed.order)
                        .isActive(true)
                        .build();
                parent = categoryRepository.save(parent);

                int subOrder = 1;
                for (String sub : seed.subs) {
                    Category child = Category.builder()
                            .parent(parent)
                            .name(sub)
                            .slug(seed.slug + "-" + sub.toLowerCase().replace(" ", "-").replace("'", ""))
                            .displayOrder(subOrder++)
                            .isActive(true)
                            .build();
                    categoryRepository.save(child);
                }
            }
            log.info("Default catalog categories and subcategories initialized.");
        }
    }

    private static class CategorySeed {
        String name;
        String slug;
        int order;
        List<String> subs;

        CategorySeed(String name, String slug, int order, List<String> subs) {
            this.name = name;
            this.slug = slug;
            this.order = order;
            this.subs = subs;
        }
    }
}
