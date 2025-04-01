"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertDateDDMMYYYY = convertDateDDMMYYYY;
exports.convertDateMMDDYYYY = convertDateMMDDYYYY;
/**
 * Function to convert date string from DDMMYYYY to YYYY-MM-DD
 * @param dateStr
 * @returns
 */
function convertDateDDMMYYYY(dateStr) {
    if (!dateStr || dateStr.length !== 8)
        return null; // Ensure valid format
    var day = dateStr.substring(0, 2);
    var month = dateStr.substring(2, 4);
    var year = dateStr.substring(4, 8);
    return "".concat(year, "-").concat(month, "-").concat(day); // Convert to YYYY-MM-DD
}
/**
 * Function to convert date string from MMDDYYYY to YYYY-MM-DD
 * @param dateStr
 * @returns
 */
function convertDateMMDDYYYY(dateStr) {
    if (!dateStr || dateStr.length !== 8)
        return null; // Ensure valid format
    var month = dateStr.substring(0, 2);
    var day = dateStr.substring(2, 4);
    var year = dateStr.substring(4, 8);
    return "".concat(year, "-").concat(month, "-").concat(day); // Convert to YYYY-MM-DD
}
