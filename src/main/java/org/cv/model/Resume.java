package org.cv.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.cv.model.enums.TemplateType;

@Entity
@Table(name = "resumes")
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    String fullName;
    String bio;

    @Lob
    @Column(columnDefinition = "TEXT")
    String skillsJson;

    @Lob
    @Column(columnDefinition = "TEXT")
    String projectsJson;

    @Enumerated(EnumType.STRING)
    TemplateType template;

    @Column(unique = true)
    String publicUrl;

    @Lob
    @Column(columnDefinition = "TEXT")
    String photo;

    @OneToOne
    @JoinColumn(name = "user_id")
    User user;
}