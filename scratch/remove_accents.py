import re
import unicodedata

def remove_accents(input_str):
    s = re.sub(r'[àáạảãâầấậẩẫăằắặẳẵ]', 'a', input_str)
    s = re.sub(r'[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]', 'A', s)
    s = re.sub(r'[èéẹẻẽêềếệểễ]', 'e', s)
    s = re.sub(r'[ÈÉẸẺẼÊỀẾỆỂỄ]', 'E', s)
    s = re.sub(r'[òóọỏõôồốộổỗơờớợởỡ]', 'o', s)
    s = re.sub(r'[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]', 'O', s)
    s = re.sub(r'[ìíịỉĩ]', 'i', s)
    s = re.sub(r'[ÌÍỊỈĨ]', 'I', s)
    s = re.sub(r'[ùúụủũưừứựửữ]', 'u', s)
    s = re.sub(r'[ÙÚỤỦŨƯỪỨỰỬỮ]', 'U', s)
    s = re.sub(r'[ỳýỵỷỹ]', 'y', s)
    s = re.sub(r'[ỲÝỴỶỸ]', 'Y', s)
    s = re.sub(r'[Đ]', 'D', s)
    s = re.sub(r'[đ]', 'd', s)
    return s

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    provinces = [
        "Hồ Chí Minh", "Đồng Nai", "Tây Ninh", "Long An", "Bến Tre", "Bình Dương",
        "Đà Nẵng", "Hà Nội", "Cần Thơ", "Khánh Hòa", "Hải Phòng", "Đắk Lắk",
        "Lâm Đồng", "Thanh Hóa", "Quảng Ninh", "Bà Rịa - Vũng Tàu", "Bình Phước",
        "Bình Thuận", "Tiền Giang", "Đăk Nông", "Bắc Giang", "Bắc Kạn", "Bạc Liêu",
        "Bắc Ninh", "Bình Định", "Cà Mau", "Cao Bằng", "Đắk Nông"
    ]

    for p in provinces:
        p_no_accent = remove_accents(p)
        content = content.replace(p, p_no_accent)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

process_file(r'd:\Project\QuantumShield\backend\main.go')
print("Successfully removed accents in main.go")
