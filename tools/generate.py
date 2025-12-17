import json
import random
from faker import Faker

fake = Faker('pt_BR')

def generate_mock_data():
    data = {
        "users": [],
        "baskets": [],
        "subscriptions": []
    }

    # --- 1. Sellers (IDs 1-5) ---
    for i in range(1, 6):
        seller_id = i  # <--- This was missing!
        
        data["users"].append({
            "id": seller_id,
            "role": "vendedor",
            "name": fake.company(),
            "email": fake.company_email(),
            "password": "password123",
            "cnpj": fake.cnpj(),   # Generate CNPJ
            "cpf": "",             # Empty for sellers
            "address": {
                "street": fake.street_name(),
                "number": str(random.randint(1, 999)),
                "city": fake.city(),
                "state": fake.state_abbr(),
                "zip_code": fake.postcode()
            }
        })

        # --- Baskets for this Seller ---
        for j in range(1, 4):
            basket_id = (i * 100) + j
            data["baskets"].append({
                "id": basket_id,
                "seller_id": seller_id,
                "name": f"Kit {fake.word().capitalize()}",
                "description": fake.sentence(nb_words=12),
                "price": round(random.uniform(49.90, 199.90), 2)
            })

    # --- 2. Consumers (IDs 10-50) ---
    for k in range(10, 50):
        data["users"].append({
            "id": k,
            "role": "assinante",
            "name": fake.name(),
            "email": fake.email(),
            "password": "password123",
            "cnpj": "",            
            "cpf": fake.cpf(),     
            "address": {
                "street": fake.street_name(),
                "number": str(random.randint(10, 9999)),
                "city": fake.city(),
                "state": fake.state_abbr(),
                "zip_code": fake.postcode()
            }
        })

    # --- 3. Subscriptions ---
    active_consumers = [u for u in data["users"] if u["role"] == "consumer"]
    all_baskets = data["baskets"]
    subscription_id = 1

    for consumer in active_consumers:
        # 40% chance a user has a subscription
        if random.random() > 0.4:
            basket = random.choice(all_baskets)
            data["subscriptions"].append({
                "id": subscription_id,
                "user_id": consumer["id"],
                "basket_id": basket["id"],
                "frequency": fake.random_element(elements=("semanal", "quinzenal", "mensal")),
                "status": fake.random_element(elements=("ativo", "pausado", "cancelado"))
            })
            subscription_id += 1

    return data

if __name__ == "__main__":
    print(json.dumps(generate_mock_data(), indent=2, ensure_ascii=False))