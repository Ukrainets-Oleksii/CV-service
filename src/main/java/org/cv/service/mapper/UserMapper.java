package org.cv.service.mapper;

import org.cv.model.User;
import org.cv.model.dto.RegisterRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "token", ignore = true)
    User fromRegister(RegisterRequest request);
}