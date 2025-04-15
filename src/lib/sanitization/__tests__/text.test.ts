// import { TextSanitizer } from '../text';

// describe('TextSanitizer', () => {
//   describe('sanitize', () => {
//     it('should remove HTML tags when removeHtml is true', () => {
//       const input = '<script>alert("xss")</script>Hello';
//       const result = TextSanitizer.sanitize(input, { removeHtml: true });
//       expect(result).not.toContain('<script>');
//     });

//     it('should remove control characters when removeControlChars is true', () => {
//       const input = 'Hello\x00World\x0B';
//       const result = TextSanitizer.sanitize(input, { removeControlChars: true });
//       expect(result).toBe('HelloWorld');
//     });

//     it('should normalize whitespace when normalizeWhitespace is true', () => {
//       const input = 'Hello    World\n\n\tTest';
//       const result = TextSanitizer.sanitize(input, { normalizeWhitespace: true });
//       expect(result).toBe('Hello World Test');
//     });
//   });

//   describe('sanitizeGenerationInput', () => {
//     it('should apply all sanitization rules', () => {
//       const input = '<p>Hello\n\n  World\x00</p>';
//       const result = TextSanitizer.sanitizeGenerationInput(input);
//       expect(result).toBe('&lt;p&gt;Hello World&lt;/p&gt;');
//     });
//   });
// }); 