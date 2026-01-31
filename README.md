# 📌 JJO Admin Panel  
### Next.js + AWS Lambda + API Gateway + DynamoDB + Authorizer  

---

## 🚀 Project Overview  

This is a **full-stack web application** built using **Next.js** for the frontend and **AWS Lambda** for the backend.  
All backend APIs are securely exposed using **AWS API Gateway**, and application data is stored in **Amazon DynamoDB**.  

The project includes(till now):  

- ✅ Custom Token-Based Authentication (for admins only)
- ✅ API Gateway Custom Lambda Authorizer  
- ✅ Admin Login System  
- ✅ Members Management (CRUD)  
- ✅ Email Template Management (CRUD)  
- ✅ Email Sending Feature  
- ✅ Efficient API State Management using TanStack Query

This architecture ensures scalability, security, and minimal infrastructure management.  

---

## 🏗️ Tech Stack  

### Frontend  
- **Next.js (React Framework)**  
- Tailwind CSS  
- Fetch API / Axios  
- TanStack Query (React Query) → API fetching + CRUD state management

### Backend  
- **AWS Lambda (Python)**  

### AWS Services  
- **API Gateway** → Secure REST API routing  
- **Lambda Authorizer** → For accessing of api only by admin users 
- **DynamoDB** → NoSQL database storage  

---

## 🌐 System Architecture  

```
User → Next.js Frontend → API Gateway → Authorizer → Lambda → DynamoDB
```

### Request Flow  

1. User logs in through frontend  
2. Backend generates an authentication token  
3. Token is stored in frontend  
4. Token is included in every API request  
5. API Gateway Authorizer validates token  
6. Authorized requests trigger Lambda functions  
7. DynamoDB stores and retrieves data  

---

# 🔐 Authentication & Authorization  

## Admin Login  

| Lambda Function | Purpose |
|----------------|---------|
| `Admin_login_Dev` | Authenticates admin & generates token |

### Login Response Example  

```json
{
  "message": "Login successful",
  "token": "generated-access-token"
}
```

---

## Authorizer  

| Lambda Function | Purpose |
|----------------|---------|
| `authorizer` | Validates token before API access |

API Gateway uses this Lambda Authorizer to protect all private endpoints.  

---

## Token Usage  

All protected API calls require the token in headers:

```http
Authorization: Bearer <token>
```

Example in Next.js:

```js
const { data, isLoading } = useQuery({
  queryKey: ["members"],
  queryFn: fetchMembers,
});

```

---

# 👥 Members Management Module  

Provides full CRUD operations for JJO Members.

## Lambda Functions  

| Function Name | Operation |
|--------------|-----------|
| `Create_JJO_Members_DEV` | Create Member |
| `Fetch_JJO_Members_DEV`  | Fetch Members |
| `Update_JJO_Members_DEV` | Update Member |
| `Delete_JJO_Members_DEV` | Delete Member |

---

## API Endpoints  

| Method | Endpoint | Lambda |
|--------|----------|--------|
| POST   | `/members` | Create_JJO_Members_DEV |
| GET    | `/members` | Fetch_JJO_Members_DEV |
| PUT    | `/members?{id}` | Update_JJO_Members_DEV |
| DELETE | `/members?{id}` | Delete_JJO_Members_DEV |

---

# 📧 Email Template Management  

Manage reusable email templates stored in DynamoDB.

## Lambda Functions  

| Function Name | Operation |
|--------------|-----------|
| `Create_JJO_Email_Template_DEV` | Create Template |
| `Fetch_JJO_Email_Template_DEV`  | Fetch Templates |
| `Update_JJO_Email_Template_DEV` | Update Template |
| `Delete_JJO_Email_Template_DEV` | Delete Template |

---

## API Endpoints  

| Method | Endpoint | Lambda |
|--------|----------|--------|
| POST   | `/email-template` | Create_JJO_Email_Template_DEV |
| GET    | `/email-template` | Fetch_JJO_Email_Template_DEV |
| PUT    | `/email-template?{id}` | Update_JJO_Email_Template_DEV |
| DELETE | `/email-template?{id}` | Delete_JJO_Email_Template_DEV |

---

# ✉️ Email Sending Module  

Send emails to members using templates.

## Lambda Function  

| Function Name | Purpose |
|--------------|---------|
| `Send_email_dev` | Sends email to members |

---

## API Endpoint  

| Method | Endpoint | Lambda |
|--------|----------|--------|
| POST   | `/send-email` | Send_email_dev |

---

# 🗄️ DynamoDB Tables  

## Members Table  

### Primary Keys
| Attribute | Type | Key Type | Description |
| :--- | :--- | :--- | :--- |
| **FamilyId** | `String` | **Partition Key (PK)** | Unique identifier for a family unit. |
| **MemberId** | `String` | **Sort Key (SK)** | Unique identifier for an individual within a family. |

### Attributes
| Attribute | Type | Description |
| :--- | :--- | :--- |
| **UUID** | `String` | Global unique identifier (legacy/system ID). |
| **Name** | `String` | Full name of the member. |
| **Gender** | `String` | M / F / Other. |
| **DOB** | `String` | Date of Birth (ISO-8601: YYYY-MM-DD). |
| **EmailAddress** | `String` | Contact email address. |
| **PhoneNo** | `String` | Contact phone number. |
| **Activity** | `String` | Associated activity (e.g., Natok). |
| **Amount** | `Number` | Deposit or contribution amount. |
| **ForYear** | `String` | The financial/academic year (e.g., 2025/26). |
| **TransactionID**| `String` | Reference ID for the payment transaction. |
| **DepositDate** | `String` | Date the amount was deposited (ISO-8601). |
| **Street** | `String` | Residential street address. |
| **City** | `String` | City of residence. |
| **State** | `String` | State / Province. |
| **Zip** | `String` | Postal / Zip code. |
| **WhatsappMember**| `Boolean`| Status of WhatsApp group membership. |
| **Comments** | `String` | Additional notes or remarks. |
| **CreatedAt** | `String` | System timestamp when the record was created. |


---

## Email Templates Table  

| Attribute | Type | Key |
|----------|------|-----|
| id | String | Partition Key |
| name    | String | Attribute |
| subject    | String | Attribute |
| body       | String | Attribute |

---

# 🎨 Frontend Setup (Next.js)  

## Installation  

```bash
cd frontend
npm install
npm run dev
```

Runs on:

```
http://localhost:3000
```

---

## Environment Variables  

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=https://clkovxgt00.execute-api.us-east-1.amazonaws.com/jjo-api
```


