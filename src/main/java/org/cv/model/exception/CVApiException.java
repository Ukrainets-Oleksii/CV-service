package org.cv.model.exception;

import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;
import org.springframework.http.HttpStatus;

@Getter
public class CVApiException extends RuntimeException {

    protected HttpStatus code;
    @Setter
    protected boolean slackUpdate = true;

    public CVApiException(@NonNull String msg, @NonNull HttpStatus errorCode) {
        super(msg);
        this.code = errorCode;
    }
}
