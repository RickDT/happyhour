export function generateUUID() {
  // Generate 16 random bytes
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);

  // Adjust certain bits according to RFC 4122, section 4.4 as follows:
  // Set the 4 most significant bits of the 7th byte to 0100'b, so the high nibble is 4
  array[6] = (array[6] & 0x0f) | 0x40;
  // Set the 2 most significant bits of the 9th byte to 10'b, so it's one of 8, 9, A, or B
  array[8] = (array[8] & 0x3f) | 0x80;

  // Convert the byte array to a hexadecimal string
  const uuid = Array.from(array, (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
  // Insert dashes to format it as a UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  return `${uuid.substring(0, 8)}-${uuid.substring(8, 12)}-${uuid.substring(
    12,
    16
  )}-${uuid.substring(16, 20)}-${uuid.substring(20)}`;
}

// console.log(generateUUID());
