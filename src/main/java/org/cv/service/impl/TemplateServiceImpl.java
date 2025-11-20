package org.cv.service.impl;

import lombok.RequiredArgsConstructor;
import org.cv.model.dto.TemplateDto;
import org.cv.model.enums.TemplateType;
import org.cv.service.TemplateService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TemplateServiceImpl implements TemplateService {

    @Override
    @Transactional
    public List<TemplateDto> getAllTemplates() {
        return Arrays.stream(TemplateType.values())
                .map(t -> {
                    TemplateDto dto = new TemplateDto();
                    dto.setName(t.name());
                    return dto;
                })
                .toList();
    }
}
