package org.cv.service.impl;

import lombok.RequiredArgsConstructor;
import org.cv.model.Resume;
import org.cv.model.User;
import org.cv.model.dto.PublicResumeDto;
import org.cv.model.dto.ResumeDto;
import org.cv.model.dto.TemplateUpdateRequest;
import org.cv.model.exception.CVApiException;
import org.cv.repository.ResumeRepository;
import org.cv.repository.UserRepository;
import org.cv.service.ResumeService;
import org.cv.service.mapper.ResumeMapper;
import org.cv.util.JsonUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ResumeServiceImpl implements ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final ResumeMapper resumeMapper;

    @Override
    @Transactional
    public ResumeDto getOwnResume(User user) {
        Resume resume = resumeRepository.findByUserId(user.getId())
                .orElseGet(() -> createEmptyResume(user));

        return resumeMapper.toDto(resume);
    }

    @Override
    @Transactional
    public PublicResumeDto getPublicResume(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CVApiException("User not found", HttpStatus.NOT_FOUND));

        Resume resume = resumeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new CVApiException("Resume not found", HttpStatus.NOT_FOUND));

        return resumeMapper.toPublicDto(resume);
    }

    @Override
    @Transactional
    public ResumeDto updateResume(User user, ResumeDto dto) {
        Resume resume = resumeRepository.findByUserId(user.getId())
                .orElseGet(() -> createEmptyResume(user));

        resumeMapper.updateEntity(resume, dto);

        resume.setSkillsJson(JsonUtils.write(dto.getSkills()));
        resume.setProjectsJson(JsonUtils.write(dto.getProjects()));

        resumeRepository.save(resume);
        return resumeMapper.toDto(resume);
    }

    @Override
    @Transactional
    public void updateTemplate(User user, TemplateUpdateRequest request) {
        Resume resume = resumeRepository.findByUserId(user.getId())
                .orElseGet(() -> createEmptyResume(user));

        resume.setTemplate(request.getTemplate());
        resumeRepository.save(resume);
    }

    @Override
    @Transactional
    public void updatePhoto(User user, String base64Photo) {
        Resume resume = resumeRepository.findByUserId(user.getId())
                .orElseGet(() -> createEmptyResume(user));

        resume.setPhoto(base64Photo);
        resumeRepository.save(resume);
    }

    @Override
    @Transactional
    public void deletePhoto(User user) {
        Resume resume = resumeRepository.findByUserId(user.getId())
                .orElseGet(() -> createEmptyResume(user));

        resume.setPhoto(null);
        resumeRepository.save(resume);
    }

    private Resume createEmptyResume(User user) {
        Resume resume = Resume.builder()
                .user(user)
                .publicUrl("/api/profile/public/" + user.getUsername())
                .skillsJson("[]")
                .projectsJson("[]")
                .build();

        return resumeRepository.save(resume);
    }
}