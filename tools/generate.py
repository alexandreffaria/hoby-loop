import json
import random
from faker import Faker

# Initialize Faker with Brazilian locale for realistic data (CPF, CEP, Addresses)
fake = Faker('pt_BR')

def generate_mock_data():
    data = {
        "sellers": [],
        "products": [],
        "users": [],
        "subscriptions": [] # The specific data for "Lista Marca"
    }

    # 1. Generate Sellers (Marcas)
    for i in range(1, 4): # Create 3 sellers
        seller_id = f"seller_{i}"
        data["sellers"].append({
            "id": seller_id,
            "name": fake.company(),
            "owner_name": fake.name(),
            "email": fake.company_email()
        })

        # 2. Generate Products (Assinaturas) for this Seller
        # Matches fields from 'Assinante- Tela cadastro' [cite: 4, 5, 6]
        for j in range(1, 4): 
            product_id = f"prod_{seller_id}_{j}"
            
            # Randomize logic based on PDF options "Durante 6 meses", "Mensalmente"
            duration_options = ["Durante 3 meses", "Durante 6 meses", "Durante 12 meses"]
            freq_options = ["Mensalmente", "Quinzenalmente", "Semanalmente"]
            
            data["products"].append({
                "id": product_id,
                "seller_id": seller_id,
                "name": f"Assinatura {fake.word().capitalize()}", # "NOME DA ASSINATURA"
                "description": fake.sentence(nb_words=10), # "Descrição"
                "image_url": "https://via.placeholder.com/150", # "Foto dp produto"
                "duration_label": random.choice(duration_options), 
                "frequency_label": random.choice(freq_options),
                "price": round(random.uniform(49.90, 199.90), 2)
            })

    # 3. Generate Users (Assinantes)
    # Matches fields from 'Assinante- Tela cadastro' address section [cite: 7, 8, 11, 12]
    for k in range(1, 21): # Create 20 users
        user_id = f"user_{k}"
        
        # specific logic to mimic "FLN/SC" format found in PDF [cite: 13]
        state = fake.state_abbr()
        city = fake.city()
        
        data["users"].append({
            "id": user_id,
            "name": fake.name(), # "NOME DO ASSINANTE"
            "email": fake.email(),
            "avatar_url": f"https://i.pravatar.cc/150?u={user_id}",
            "address": {
                "street": fake.street_name(), # "Rua"
                "number": str(random.randint(10, 9999)), # "N-456"
                "complement": f"Apto {random.randint(1, 100)}" if random.choice([True, False]) else "", # "Complemento"
                "zip_code": fake.postcode(), # "CEP"
                "city_state": f"{city}/{state}", # "FLN/SC"
                "reference": "Próximo ao mercado" # "Referência"
            },
            "payment_method": {
                "last4": str(random.randint(1000, 9999)), # "Dados do Cartão"
                "brand": random.choice(["Visa", "Mastercard"])
            }
        })

    # 4. Generate Active Subscriptions (The "Lista Marca" View)
    # This connects a User to a Product 
    for user in data["users"]:
        # Randomly assign some users to subscriptions
        if random.random() > 0.3: 
            product = random.choice(data["products"])
            
            data["subscriptions"].append({
                "id": f"sub_{user['id']}_{product['id']}",
                "status": "active",
                "user_summary": {
                    "name": user["name"],
                    "address_line_1": f"{user['address']['street']}, {user['address']['number']}",
                    "address_line_2": user['address']['zip_code'] + " " + user['address']['city_state']
                },
                "product_summary": {
                    "name": product["name"],
                    "duration": product["duration_label"],
                    "frequency": product["frequency_label"]
                }
            })

    return data

if __name__ == "__main__":
    mock_data = generate_mock_data()
    print(json.dumps(mock_data, indent=2, ensure_ascii=False))