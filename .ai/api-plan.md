# REST API Plan

## 1. Resources

1. **Flashcards**

   - **Database Table:** flashcards
   - **Description:** Represents individual flashcards with details like title, front, back, tags, source (enum: 'ai', 'ai_edited', 'manual'), creation and update timestamps. Indexes on user_id, generation_id, and created_at improve query performance.

2. **Generations**

   - **Database Table:** generations
   - **Description:** Represents flashcard generation sessions initiated by the AI. Stores metadata such as generated_count, accepted counts, edited_count, generation_duration, and timestamps. Indexes on user_id and created_at support efficient querying.

3. **Generation Error Logs**

   - **Database Table:** generation_error_logs
   - **Description:** Stores error details related to flashcard generation sessions. Each log is associated with a generation session. Indexes on generation_id and user_id ensure fast look-up.

4. **User (External)**
   - **Note:** While not directly managed through our API (handled by Supabase Auth), user identity is integral to resource isolation and RLS enforcement.

## 2. Endpoints

### Flashcards Endpoints

1. **GET /flashcards**

   - **Description:** Retrieve a paginated list of the authenticated user's flashcards. Supports filtering (e.g., by tag) and sorting (e.g., by created_at).
   - **Query Parameters:**
     - `limit` (integer): Number of flashcards per page.
     - `offset` (integer): Pagination offset.
     - `tag` (string, optional): Filter flashcards by a specific tag.
   - **Response JSON Structure:**
     ```json
     {
       "data": [
         {
           "id": "UUID",
           "title": "string",
           "front": "string",
           "back": "string",
           "tags": ["string"],
           "source": "ai | ai_edited | manual",
           "created_at": "ISO8601 timestamp",
           "updated_at": "ISO8601 timestamp",
           "generation_id": "UUID or null"
         }
       ],
       "pagination": { "limit": 10, "offset": 0, "total": 100 }
     }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:** 401 Unauthorized, 500 Internal Server Error

2. **GET /flashcards/{flashcardId}**

   - **Description:** Retrieve a single flashcard by its ID.
   - **Response JSON Structure:**
     ```json
     {
       "id": "UUID",
       "title": "string",
       "front": "string",
       "back": "string",
       "tags": ["string"],
       "source": "ai | ai_edited | manual",
       "created_at": "ISO8601 timestamp",
       "updated_at": "ISO8601 timestamp",
       "generation_id": "UUID or null"
     }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:** 401 Unauthorized, 404 Not Found, 500 Internal Server Error

3. **POST /flashcards** (Create flashcards - manual, AI-generated, or AI-edited)

   - **Validations:**

     - `front`: Maximum length of 200 characters
     - `back`: Maximum length of 500 characters
     - `source`: Must be one of 'ai_full', 'ai_edited', 'manual'

   - **Description:** Create a new flashcard (manual creation).
   - **Request JSON Structure:**
     ```json
     {
       "title": "string",
       "front": "string",
       "back": "string",
       "tags": ["string"],
       "source": "manual"
     }
     ```
   - **Response JSON Structure:**
     ```json
     {
       "id": "UUID",
       "title": "string",
       "front": "string",
       "back": "string",
       "tags": ["string"],
       "source": "manual",
       "created_at": "ISO8601 timestamp",
       "updated_at": "ISO8601 timestamp",
       "generation_id": null
     }
     ```
   - **Success Codes:** 201 Created
   - **Error Codes:** 400 Bad Request, 401 Unauthorized, 500 Internal Server Error

4. **PUT /flashcards/{flashcardId}**

   - **Description:** Update an existing flashcard (e.g., editing details of a generated or manually created flashcard).
   - **Request JSON Structure:**
     ```json
     {
       "title": "string (optional)",
       "front": "string (optional)",
       "back": "string (optional)",
       "tags": ["string"]
     }
     ```
   - **Response JSON Structure:** Similar structure as GET /flashcards/{flashcardId}
   - **Success Codes:** 200 OK
   - **Error Codes:** 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Server Error
   - **Validations:**

     - `front`: Optional, maximum length of 200 characters
     - `back`: Optional, maximum length of 500 characters
     - `source`: Must be one of 'ai_full', 'ai_edited'

   - **Description:** Update an existing flashcard (e.g., editing details of a generated or manually created flashcard).
   - **Request JSON Structure:**
     ```json
     {
       "title": "string (optional)",
       "front": "string (optional)",
       "back": "string (optional)",
       "tags": ["string"]
     }
     ```
   - **Response JSON Structure:** Similar structure as GET /flashcards/{flashcardId}
   - **Success Codes:** 200 OK
   - **Error Codes:** 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Server Error

5. **DELETE /flashcards/{flashcardId}**
   - **Description:** Delete a flashcard.
   - **Success Codes:** 204 No Content
   - **Error Codes:** 401 Unauthorized, 404 Not Found, 500 Internal Server Error

### Generations Endpoints

1. **POST /generations**

   - **Description:** Initiate an AI flashcard proposals generation session. The user submits a large text input and receives proposed flashcards.
   - **Request JSON Structure:**
     ```json
     {
       "input_text": "string (1000-10000 characters)",
       "metadata": { "optional": "any additional context" }
     }
     ```
   - **Response JSON Structure:**
     ```json
     {
       "id": "UUID",
       "generated_count": 10,
       "accepted_unedited_count": null,
       "accepted": null,
       "edited_count": null,
       "generation_duration": 2500,
       "created_at": "ISO8601 timestamp",
       "updated_at": "ISO8601 timestamp",
       "flashcards_proposals": [
         {
           "title": "string",
           "front": "string",
           "back": "string",
           "tags": ["string"],
           "source": "ai"
         }
       ]
     }
     ```
   - **Success Codes:** 201 Created
   - **Error Codes:** 400 Bad Request (e.g., input text too short/long), 401 Unauthorized, 500 Internal Server Error

2. **GET /generations**

   - **Description:** Retrieve a paginated list of generation sessions for the authenticated user.
   - **Query Parameters:** Similar to flashcards (e.g., limit, offset)
   - **Response JSON Structure:**
     ```json
     {
       "data": [
         {
           "id": "UUID",
           "generated_count": 10,
           "generation_duration": 2500,
           "created_at": "ISO8601 timestamp"
         }
       ],
       "pagination": { "limit": 10, "offset": 0, "total": 50 }
     }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:** 401 Unauthorized, 500 Internal Server Error

3. **GET /generations/{generationId}**
   - **Description:** Retrieve details of a specific generation session, including the list of proposed flashcards.
   - **Response JSON Structure:** Similar to the POST response from /generations
   - **Success Codes:** 200 OK
   - **Error Codes:** 401 Unauthorized, 404 Not Found, 500 Internal Server Error

### Generation Error Logs Endpoints

1. **GET /generations/{generationId}/error_logs**
   - **Description:** Retrieve error logs for a given generation session.
   - **Response JSON Structure:**
     ```json
     {
       "data": [
         {
           "id": "UUID",
           "error_details": { "error": "detailed error message" },
           "created_at": "ISO8601 timestamp"
         }
       ]
     }
     ```
   - **Success Codes:** 200 OK
   - **Error Codes:** 401 Unauthorized, 404 Not Found, 500 Internal Server Error

## 3. Authentication and Authorization

- **Mechanism:**

  - The API leverages JWT-based authentication typically provided by Supabase Auth. All endpoints require a valid token to access resources.
  - Row Level Security (RLS) is enforced in the database to ensure that users can only access and modify their own data. For instance, the RLS policies in the database ensure operations like SELECT, INSERT, UPDATE, and DELETE are only allowed if the resource's `user_id` matches the authenticated user's ID.

- **Implementation Details:**
  - Clients must include the JWT in the `Authorization` header of each request.
  - Rate limiting and other security measures (e.g., input sanitization) should be implemented at the API gateway or within the backend services.

## 4. Validation and Business Logic

- **Flashcards Validation:**

  - Required fields: `title`, `front`, `back`.
  - `front` is limited to 200 characters and `back` to 500 characters as per the schema.
  - `tags` must be an array of strings; if not provided, defaults to an empty array.
  - `source` must be one of the enum values: `ai`, `ai_edited`, or `manual`.

- **Generations Validation:**

  - The `input_text` must be between 1000 and 10000 characters to ensure adequate content for generation.
  - Generation metadata (e.g., counts and duration) are maintained in the database and updated either via triggers or application logic.

- **Business Logic Mapping:**

  - **Flashcard Creation & Editing:** Users can manually create and update flashcards, with endpoints handling validation and persistence.
  - **AI Generation Session:** When a generation session is initiated via POST /generations, the API handles input validation, invokes the AI model (via integrated service like Openrouter.ai), and stores both the proposed flashcards and session metadata.
  - **Reviewing and Accepting Proposals:** The client can retrieve the generated proposals via GET /generations/{id}, and accepted flashcards may be subsequently persisted via flashcards endpoints.
  - **Error Handling:** Generation errors are logged and can be retrieved via GET /generations/{generationId}/error_logs for troubleshooting and user feedback.

- **Performance Considerations:**
  - Implement pagination, filtering, and sorting on list endpoints to reduce load.
  - Use appropriate indexing (as defined in the database schema) to enhance query performance.
  - Consider caching frequent queries and responses where applicable.
