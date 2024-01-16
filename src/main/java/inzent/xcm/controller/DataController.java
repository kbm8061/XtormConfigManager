package inzent.xcm.controller;

import org.springframework.core.io.ResourceLoader;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Map;

@RestController
public class DataController {

    private final ResourceLoader resourceLoader;

    public DataController(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    @PostMapping("/select/data")
    public ResponseEntity<String> selectData(@RequestBody Map<String, String> param) {
        try {
            String classValue = param.get("class");
            String jsonFilePath = "classpath:/static/json/" + classValue + ".json";
            var resource = resourceLoader.getResource(jsonFilePath);

            String json = new String(Files.readAllBytes(Paths.get(resource.getURI())));

            return ResponseEntity.ok(json);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error occurred: " + e.getMessage());
        }
    }
}