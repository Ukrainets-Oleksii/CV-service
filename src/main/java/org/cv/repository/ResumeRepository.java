package org.cv.repository;

import org.cv.model.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResumeRepository extends JpaRepository<Resume, String> {

    Optional<Resume> findByUserId(String userId);

    Optional<Resume> findByPublicUrl(String publicUrl);
}