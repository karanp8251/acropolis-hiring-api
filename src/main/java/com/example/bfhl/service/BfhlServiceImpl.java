package com.example.bfhl.service;

import com.example.bfhl.dto.BfhlRequest;
import com.example.bfhl.dto.BfhlResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class BfhlServiceImpl implements BfhlService {

    @Override
    public BfhlResponse processRequest(BfhlRequest request) {
        BfhlResponse response = new BfhlResponse();
        
        try {
            List<String> data = request.getData();
            List<String> evenNumbers = new ArrayList<>();
            List<String> oddNumbers = new ArrayList<>();
            List<String> alphabets = new ArrayList<>();
            List<String> specialCharacters = new ArrayList<>();
            List<Character> allAlphabetChars = new ArrayList<>();
            int sumVal = 0;

            if (data != null) {
                for (String item : data) {
                    if (item == null) continue;
                    String str = item.trim();
                    if (str.isEmpty()) continue;

                    // 1. Check if the element is an integer (positive, negative or zero)
                    if (str.matches("^-?\\d+$")) {
                        int num = Integer.parseInt(str);
                        sumVal += num;
                        if (num % 2 == 0) {
                            evenNumbers.add(str);
                        } else {
                            oddNumbers.add(str);
                        }
                    } 
                    // 2. Check if the element is alphabetical (letters only)
                    else if (str.matches("^[a-zA-Z]+$")) {
                        alphabets.add(str.toUpperCase());
                        
                        // Capture individual characters for concatenation sequence
                        for (char ch : str.toCharArray()) {
                            if (Character.isLetter(ch)) {
                                allAlphabetChars.add(ch);
                            }
                        }
                    } 
                    // 3. Otherwise, treat as special characters (or multi-chars containing special symbols)
                    else {
                        specialCharacters.add(str);
                    }
                }
            }

            // 4. Handle concatenation logic: reverse and alternate capitalization (Upper, lower...)
            StringBuilder concatBuilder = new StringBuilder();
            if (!allAlphabetChars.isEmpty()) {
                List<Character> reversedChars = new ArrayList<>(allAlphabetChars);
                Collections.reverse(reversedChars);

                for (int i = 0; i < reversedChars.size(); i++) {
                    char ch = reversedChars.get(i);
                    if (i % 2 == 0) {
                        concatBuilder.append(Character.toUpperCase(ch));
                    } else {
                        concatBuilder.append(Character.toLowerCase(ch));
                    }
                }
            }

            // 5. Populate successful DTO properties
            response.setIs_success(true);
            response.setUser_id("karan_patel_26052026");
            response.setEmail("karan.patel@acropolis.in");
            response.setRoll_number("ACR-2026-XYZ");
            response.setEven_numbers(evenNumbers);
            response.setOdd_numbers(oddNumbers);
            response.setAlphabets(alphabets);
            response.setSpecial_characters(specialCharacters);
            response.setSum(String.valueOf(sumVal));
            response.setConcat_string(concatBuilder.toString());

        } catch (Exception e) {
            response.setIs_success(false);
            response.setUser_id("karan_patel_26052026");
            response.setSum("0");
            response.setConcat_string("");
            response.setEven_numbers(new ArrayList<>());
            response.setOdd_numbers(new ArrayList<>());
            response.setAlphabets(new ArrayList<>());
            response.setSpecial_characters(new ArrayList<>());
        }

        return response;
    }
}
