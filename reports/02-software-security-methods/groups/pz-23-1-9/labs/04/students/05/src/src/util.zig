const std = @import("std");
const Io = std.Io;


/// Take unicode codepoint from source
/// Return null if next sequence is not a valid codepoint
pub fn takeCp(source: *Io.Reader) Io.Reader.Error!?u21 {
    const first = try source.peekByte();
    const cp_len = std.unicode.utf8ByteSequenceLength(first) catch return null;

    const cp = switch (cp_len) {
        1 => first,
        inline 2...4 => |n| @field(std.unicode, "utf8Decode"++.{@as(u8, n) + '0'})(
            (source.peekArray(n) catch |e| switch (e) {
                error.EndOfStream => return null,
                else => return e,
            }).*
        ) catch return null,
        else => unreachable,
    };

    source.toss(cp_len);
    return cp;
}

/// Find inversed intager in modular arithmetic
/// (num * inversed(num)) % base == 1
pub fn inversed(num: i32, base: i32) ?i32 {
    const gcd, const x, _ = egcd(@mod(num, base), base);
    return if (gcd == 1) @mod(x, base) else null;
}

/// Extended Greatest Common Divisor
pub fn egcd(smol: i32, big: i32) struct{i32, i32, i32} {
    if (smol == 0) return .{big, 0, 1};
    const gcd, const down_smol_c, const down_big_c = egcd(@mod(big, smol), smol);
    const smol_c = down_big_c - @divTrunc(big, smol) * down_smol_c;
    const big_c = down_smol_c;
    return .{gcd, smol_c, big_c};
}
