package org.cv.model.dto;

import lombok.Data;
import org.cv.model.enums.TemplateType;

import java.util.List;

@Data
public class PublicResumeDto {
    private String username;
    private String fullName;
    private String bio;
    private List<String> skills;
    private List<ProjectDto> projects;
    private TemplateType template;
    private String publicUrl;
    private String photo;
}