# Project Description

A full stack web app built with Node and Express that allows users to shorten long URLs (à la bit.ly). The project takes up four days of week 3 in the Lighthouse Labs web development bootcamp. 

# Functional Requirements
## Display Requirements

- Site Header
  - If a user is logged in, the header shows:
    - [x] the user's email
    - [x] a logout button which makes a POST request to `/logout`
  - If a user is not logged in, the header shows:
    - [x] a link to the login page (`/login`)
    - [x] a link to the registration page (`/register`)

## Behaviour Requirements

- `GET /`
  - If user is logged in:
    - [x] (Minor) redirect to `/urls`
  - If user is not logged in:
    - [ ] (Minor) redirect to `/login`
- `GET /urls`
  - If user is logged in:
    - returns HTML with:
    - [x] the site header (see Display Requirements above)
    - [x] a list (or table) of URLs the user has created, each list item containing:
      - [x] a short URL
      - [x] the short URL's matching long URL
      - [x] an edit button which makes a GET request to `/urls/:id`
      - [x] a delete button which makes a POST request to `/urls/:id/delete`
      - [ ] (Stretch) the date the short URL was created
      - [ ] (Stretch) the number of times the short URL was visited
      - [ ] (Stretch) the number of unique visits for the short URL
    - [ ] (Minor) a link to "Create a New Short Link" which makes a GET request to `/urls/new`
  - If user is not logged in:
    - [x] returns HTML with a relevant error message
- `GET /urls/new`
  - If user is logged in:
    - [x] returns HTML with:
    - [x] the site header (see Display Requirements above)
    - [x] a form which contains:
      - [x] a text input field for the original (long) URL
      - [x] a submit button which makes a POST request to `/urls/`
  - If user is not logged in:
    - [x] redirects to the `/login` page
- `GET /urls/:id`
  - if user is logged in and owns the URL for the given ID:
    - [x] returns HTML with:
    - [x] the site header (see Display Requirements above)
    - [x] the short URL (for the given ID)
    - [x] a form which contains:
      - [x] the corresponding URL
      - [x] an update button which makes a POST request to `/urls/:id`
    - [ ] (Stretch) the date the short URL was created
    - [ ] (Stretch) the number of times the short URL was visited
    - [ ] (Stretch) the number of unique visits for the short URL
  - if a URL for the given ID does not exist
    - [x] (Minor) returns HTML with a relevant error message
  - if user is not logged in:
    - [x] returns HTML with a relevant error message
  - if user is logged in but does not own the URL with the given ID:
    - [x] returns HTML with a relevant error message
- `GET /u/:id`
  - if URL for the given ID exists:
    - [x] redirects to the corresponding long URL
  - if URL for the given ID does not exist:
    - [x] (Minor) returns HTML with a relevant error message
- `POST /urls`
  - if user is logged in
    - [x] generates a short URL, saves it, and associates it with the user
    - [x] redirects to `/urls/:id`, where `:id` matches the ID of the newly saved URL
  - if user is not logged in:
    - [x] (Minor) returns HTML with a relevant error message
- `POST /urls/:id`
  - if user is logged in and owns the URL for the given ID:
    - [x] updates the URL
    - [ ] redirects to `/urls`
  - if user is not logged in:
    - [x] (Minor) returns HTML with a relevant error message
  - if user is logged in but does not own the URL for the given ID:
    - [x] (Minor) returns HTML with a relevant error message
- `POST /urls/:id/delete`
  - if user is logged in and owns the URL for the given ID:
    - [x] deletes the URL
    - [x] redirects to `/urls`
  - if user is not logged in:
    - [x] (Minor) returns HTML with a relevant error message
  - if user is logged in but does not own the URL for the given ID:
    - [x] (Minor) returns HTML with a relevant error message
- `GET /login`
  - if user is logged in:
    - [x] (Minor) redirects to `/urls`
  - if user is not logged in:
    - returns HTML with a form which contains:
      - [x] input fields for email and password
      - [x] submit button that makes a POST request to `/login`
- `GET /register`
  - if user is logged in:
    - [x] (Minor) redirects to `/urls`
  - if user is not logged in:
    - returns HTML with a form which contains:
      - [x] input fields for email and password
      - [x] a register button that makes a POST request to `/register`
- `POST /login`
  - if email and password params match an existing user:
    - [x] sets a cookie
    - [x] redirects to `/urls`
  - if email and password params don't match an existing user:
    - [-] returns HTML with a relevant error message
- `POST /register`
  - if email or password are empty:
    - [-] returns HTML with a relevant error message
  - if email already exists:
    - [-] returns HTML with a relevant error message
  - otherwise:
    - [x] creates a new user
    - [x] encrypts the new user's password with `crypt`
    - [x] sets a cookie
    - [x] redirects to `/urls`
- `POST /logout`
  - [x] deletes cookie
  - [x] redirects to `/urls`
