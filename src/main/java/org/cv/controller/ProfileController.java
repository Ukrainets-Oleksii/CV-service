package org.cv.controller;

import lombok.RequiredArgsConstructor;
import org.cv.model.User;
import org.cv.model.dto.PublicResumeDto;
import org.cv.model.dto.ResumeDto;
import org.cv.model.dto.TemplateUpdateRequest;
import org.cv.service.ResumeService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ResumeService resumeService;

    @GetMapping("/public/{username}")
    public PublicResumeDto getPublic(@PathVariable String username) {
        return resumeService.getPublicResume(username);
    }

    @GetMapping("/me")
    public ResumeDto getOwn(@RequestAttribute("user") User user) {
        return resumeService.getOwnResume(user);
    }

    @PostMapping("/me")
    public ResumeDto update(@RequestAttribute("user") User user,
                            @RequestBody ResumeDto dto) {
        return resumeService.updateResume(user, dto);
    }

    @PutMapping("/me/template")
    public void updateTemplate(@RequestAttribute("user") User user,
                               @RequestBody TemplateUpdateRequest request) {
        resumeService.updateTemplate(user, request);
    }

    @PostMapping("/me/photo")
    public void uploadPhoto(@RequestAttribute("user") User user,
                           @RequestBody Map<String, String> request) {
        String base64Photo = request.get("photo");
        resumeService.updatePhoto(user, base64Photo);
    }

    @DeleteMapping("/me/photo")
    public void deletePhoto(@RequestAttribute("user") User user) {
        resumeService.deletePhoto(user);
    }
}
