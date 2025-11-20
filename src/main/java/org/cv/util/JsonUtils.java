package org.cv.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;

public class JsonUtils {

    private static final ObjectMapper mapper = new ObjectMapper();

    public static <T> List<T> readList(String json, Class<T> clazz) {
        if (json == null || json.isEmpty()) return List.of();

        try {
            return mapper.readerForListOf(clazz).readValue(json);
        } catch (Exception e) {
            throw new RuntimeException("Cannot parse JSON", e);
        }
    }

    public static String write(Object obj) {
        try {
            return mapper.writeValueAsString(obj);
        } catch (Exception e) {
            throw new RuntimeException("Cannot write JSON", e);
        }
    }
}