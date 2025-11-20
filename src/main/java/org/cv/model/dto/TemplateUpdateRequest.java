package org.cv.model.dto;

import lombok.Data;
import org.cv.model.enums.TemplateType;

@Data
public class TemplateUpdateRequest {
    private TemplateType template;
}