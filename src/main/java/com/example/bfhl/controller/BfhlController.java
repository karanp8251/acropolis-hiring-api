package com.example.bfhl.controller;

import com.example.bfhl.dto.BfhlRequest;
import com.example.bfhl.dto.BfhlResponse;
import com.example.bfhl.service.BfhlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/bfhl")
@CrossOrigin(origins = "*") // Allows local index.html to communicate with this REST endpoint
public class BfhlController {

    private final BfhlService bfhlService;

    @Autowired
    public BfhlController(BfhlService bfhlService) {
        this.bfhlService = bfhlService;
    }

    @GetMapping
    public ResponseEntity<java.util.Map<String, Object>> getOperationCode() {
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("operation_code", 1);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<BfhlResponse> processArray(@RequestBody BfhlRequest request) {
        BfhlResponse response = bfhlService.processRequest(request);
        return ResponseEntity.ok(response);
    }
}
