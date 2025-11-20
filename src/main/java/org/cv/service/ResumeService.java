package org.cv.service;

import org.cv.model.User;
import org.cv.model.dto.PublicResumeDto;
import org.cv.model.dto.ResumeDto;
import org.cv.model.dto.TemplateUpdateRequest;

public interface ResumeService {

    ResumeDto getOwnResume(User user);

    PublicResumeDto getPublicResume(String username);

    ResumeDto updateResume(User user, ResumeDto dto);

    void updateTemplate(User user, TemplateUpdateRequest request);

    void updatePhoto(User user, String base64Photo);

    void deletePhoto(User user);
}