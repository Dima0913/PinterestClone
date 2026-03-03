-- SQL скрипт для оновлення значень за замовчуванням для налаштувань користувачів
-- Виконати після застосування міграції AddUserSettings

UPDATE Users 
SET 
    RecommendationsEnabled = 1,
    PersonalizedAds = 1,
    Searchable = 1,
    ShowEmail = 0
WHERE 
    RecommendationsEnabled = 0 AND 
    PersonalizedAds = 0 AND 
    Searchable = 0 AND 
    ShowEmail = 0;
