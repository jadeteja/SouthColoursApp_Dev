package com.southcolours.security.config;

import com.southcolours.catalog.entity.Banner;
import com.southcolours.catalog.entity.Category;
import com.southcolours.catalog.entity.Product;
import com.southcolours.catalog.entity.ProductImage;
import com.southcolours.catalog.entity.ProductVariant;
import com.southcolours.catalog.repository.BannerRepository;
import com.southcolours.catalog.repository.CategoryRepository;
import com.southcolours.catalog.repository.ProductRepository;
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

import java.math.BigDecimal;
import java.util.ArrayList;
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
    private final ProductRepository productRepository;
    private final BannerRepository bannerRepository;
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

        // 3. Seed Default Banners if empty
        if (bannerRepository.count() == 0) {
            bannerRepository.save(Banner.builder()
                    .title("Ethnic Wear for Little Ones")
                    .imageUrl("https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80")
                    .targetType("CATEGORY")
                    .displayOrder(1)
                    .isActive(true)
                    .build());
            bannerRepository.save(Banner.builder()
                    .title("Pretty Dresses for Every Occasion")
                    .imageUrl("https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80")
                    .targetType("CATEGORY")
                    .displayOrder(2)
                    .isActive(true)
                    .build());
            log.info("Default promotional banners initialized.");
        }

        // 4. Products can be added via Admin Dashboard / Admin App
        // Automatic test product seeding disabled to maintain clean catalog
    }

    private void seedProduct(String name, String slug, String desc, BigDecimal basePrice, BigDecimal discountPrice,
                             Category cat, String imageUrl, boolean isNewArrival, boolean isFeatured) {
        if (productRepository.findBySlug(slug).isPresent()) return;

        Product p = Product.builder()
                .name(name)
                .slug(slug)
                .description(desc)
                .brand("Southcolours")
                .fabric("Premium Silk / Cotton")
                .basePrice(basePrice)
                .discountPrice(discountPrice)
                .category(cat)
                .isActive(true)
                .isNewArrival(isNewArrival)
                .isFeatured(isFeatured)
                .images(new ArrayList<>())
                .variants(new ArrayList<>())
                .build();

        Product saved = productRepository.save(p);

        saved.getImages().add(ProductImage.builder()
                .product(saved)
                .imageUrl(imageUrl)
                .isPrimary(true)
                .displayOrder(0)
                .build());

        List<String> sizes = Arrays.asList("1-2Y", "2-3Y", "3-4Y", "4-5Y", "5-6Y");
        for (String sz : sizes) {
            saved.getVariants().add(ProductVariant.builder()
                    .product(saved)
                    .sku("SC-" + saved.getId() + "-" + sz)
                    .size(sz)
                    .colorName("Primary")
                    .colorHex("#EB4E8E")
                    .stockQuantity(25)
                    .reservedQuantity(0)
                    .build());
        }

        productRepository.save(saved);
    }
}
