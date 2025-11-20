package org.cv.controller;

import lombok.RequiredArgsConstructor;
import org.cv.model.dto.TemplateDto;
import org.cv.service.TemplateService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class TemplateController {

    private final TemplateService templateService;

    @GetMapping("/list")
    public List<TemplateDto> list() {
        return templateService.getAllTemplates();
    }
}
