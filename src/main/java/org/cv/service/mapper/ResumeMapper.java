package org.cv.service.mapper;

import org.cv.model.Resume;
import org.cv.model.dto.ProjectDto;
import org.cv.model.dto.PublicResumeDto;
import org.cv.model.dto.ResumeDto;
import org.cv.util.JsonUtils;
import org.mapstruct.InheritConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ResumeMapper {

    @Mapping(target = "skills", expression = "java(readSkills(resume))")
    @Mapping(target = "projects", expression = "java(readProjects(resume))")
    ResumeDto toDto(Resume resume);

    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "skills", expression = "java(readSkills(resume))")
    @Mapping(target = "projects", expression = "java(readProjects(resume))")
    PublicResumeDto toPublicDto(Resume resume);

    @InheritConfiguration(name = "toDto")
    @Mapping(target = "publicUrl", ignore = true)
    @Mapping(target = "photo", ignore = true)
    @Mapping(target = "user", ignore = true)
    void updateEntity(@MappingTarget Resume resume, ResumeDto dto);

    // -------- helper methods (default) -------- //

    default List<String> readSkills(Resume resume) {
        return JsonUtils.readList(resume.getSkillsJson(), String.class);
    }

    default List readProjects(Resume resume) {
        return JsonUtils.readList(resume.getProjectsJson(), ProjectDto.class);
    }
}