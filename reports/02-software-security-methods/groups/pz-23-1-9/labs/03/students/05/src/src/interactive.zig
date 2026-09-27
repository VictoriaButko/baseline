const std = @import("std");
const global = @import("global.zig");
const algo = @import("algorithms.zig");
const util = @import("util.zig");
const Io = std.Io;
const print = std.debug.print;

var stdin: *Io.Reader = undefined;

pub fn main(init: std.process.Init.Minimal) !u8 {
    _ = init;

    const CmdType = fn ([]const u8, *std.mem.SplitIterator(u8, .any)) void;
    const cmds_map: std.StaticStringMap(*const CmdType) = .initComptime(.{
        .{"encrypt", encryptOrDecrypt},
        .{"decrypt", encryptOrDecrypt},
        .{"view", viewFile},
        .{"frequency", analyzeFrequency},
        .{"crack", tryCrackManual},
        .{"auto_crack", tryCrackChiSqrInteractive},
        .{"crack_by_known", crackByKnownLetters},
        .{"coincidence_index", coincidenceIndex},
    });

    var stdin_buf: [1024]u8 = undefined;
    var stdin_reader = Io.File.stdin().reader(global.io, &stdin_buf);
    stdin = &stdin_reader.interface;

    // Can be replaced with readline
    var local_stdin_buf: [1024]u8 = undefined;
    var local_stdin_reader = Io.File.stdin().reader(global.io, &local_stdin_buf);
    const local_stdin = &local_stdin_reader.interface;

    while (true) {
        print("\nEnter command: ", .{});
        const line = (local_stdin.takeDelimiter('\n') catch |e| {
            print("Line reading error: {t}\n", .{e});
            return 1;
        }) orelse break;
        if (line.len <= 1) continue; // Skip empty line inputs

        var it = std.mem.splitAny(u8, line, &.{' ', '\n'});
        const cmd = it.next() orelse continue;

        const cmd_fn = cmds_map.get(cmd) orelse {
            print("No such command: {s}\n", .{cmd});
            continue;
        };
        cmd_fn(cmd, &it);
    }
    return 0;
}

fn nextArg(it: *std.mem.SplitIterator(u8, .any), prompt: []const u8) ?[]const u8 {
    while (it.next()) |next| {
        if (next.len == 0) continue;
        return next;
    }
    print("Enter {s}: ", .{prompt});
    return stdin.takeDelimiter('\n') catch null;
}

const ArgFileOpts = union(enum) {
    open: Io.Dir.OpenFileOptions,
    create: Io.Dir.CreateFileOptions,
};
fn nextArgFile(it: *std.mem.SplitIterator(u8, .any), prompt: []const u8, opts: ArgFileOpts) ?Io.File {
    const path = nextArg(it, prompt) orelse return null;
    return switch (opts) {
        .open => |o|
            Io.Dir.cwd().openFile(global.io, path, o),
        .create => |o|
            if (std.mem.eql(u8, path, "stdout")) Io.File.stdout()
            else Io.Dir.cwd().createFile(global.io, path, o),
    } catch |e| {
        print("Failed to open {s}: {t}\n", .{path, e});
        return null;
    };
}

fn nextArgAlgo(it: *std.mem.SplitIterator(u8, .any)) ?algo.AlgoType {
    const algo_str = nextArg(it, "algorithm") orelse return null;
    return std.meta.stringToEnum(algo.AlgoType, algo_str) orelse {
        print("No such algorithm: |{s}|\n", .{algo_str});
        return null;
    };
}

// Args: algorithm, source file, destination file (optionaly stdout), key
fn encryptOrDecrypt(cmd_name: []const u8, it: *std.mem.SplitIterator(u8, .any)) void {
    const op_type: algo.OpType = if (std.mem.eql(u8, cmd_name, "encrypt")) .encrypt
                                 else .decrypt;

    const algo_type = nextArgAlgo(it) orelse return;

    const in_file = nextArgFile(it, "source file", .{.open = .{.allow_directory = false}}) orelse return;
    defer in_file.close(global.io);

    const out_file = nextArgFile(it, "destination file", .{.create = .{}}) orelse return;
    defer if (out_file.handle != Io.File.stdout().handle) out_file.close(global.io);

    const key = nextArg(it, "key") orelse return;

    const res = algo.runCryptAlgoOnFiles(algo_type, op_type, key, in_file, out_file);
    if (res) |succeed| {
        if (succeed) {
            print("Operation succeed\n", .{});
        } else {
            print("Operation failed\n", .{});
        }
    } else |e| {
        print("Operation failed with error: {t}\n", .{e});
    }
}

fn viewFile(cmd_name: []const u8, it: *std.mem.SplitIterator(u8, .any)) void {
    _ = cmd_name;
    const file = nextArgFile(it, "source file", .{.open = .{.allow_directory = false}}) orelse return;
    defer file.close(global.io);

    const buf_sz = 256;
    var file_buf: [buf_sz]u8 = undefined;
    var file_rd = file.reader(global.io, &file_buf);

    var out_buf: [buf_sz]u8 = undefined;
    const stderr = std.debug.lockStderr(&out_buf);

    _ = file_rd.interface.stream(&stderr.file_writer.interface, .unlimited) catch |e| {
        std.debug.unlockStderr();
        print("Streaming error: {t}\n", .{e});
        return;
    };
    std.debug.unlockStderr();
}

/// Get full frequency analysis of file
fn analyzeFrequency(cmd_name: []const u8, it: *std.mem.SplitIterator(u8, .any)) void {
    _ = cmd_name;
    const file = nextArgFile(it, "source file", .{.open = .{.allow_directory = false}}) orelse return;
    defer file.close(global.io);

    const letters, const freqs = englishFreqs(file);
    printFreqTable(letters.len, &letters, &freqs, 1, &algo.freq.englishFreqs);

    const top = algo.freq.sortDownIndices(f32, freqs.len, &freqs);
    print("\nTop 10 letters:\n", .{});
    for (top[0..10], 1..) |i, place| {
        print("{d}: {u} - {d}\n", .{place, letters[i], freqs[i]});
    }
}

/// Print frequences in fancy table format
fn printFreqTable(comptime n: usize, charset: *const [n]u21, freqs: *const [n]f32,
                  columns: usize, compare: ?*const [n]f32) void {
    const heads = .{"Letter", "Frequency", "Expected", "Deviation"};

    // Print headers
    for (0..columns) |_| {
        std.debug.print("| {s} | {s} ", .{heads[0], heads[1]});
        if (compare) |_| std.debug.print("| {s} | {s} ", .{heads[2], heads[3]});
    }
    std.debug.print("|\n", .{});

    // Print separators
    for (0..columns) |_| {
        std.debug.print("|-{0c:-^[1]}-|-{0c:-^[2]}-",
                        .{'-', heads[0].len, heads[1].len});
        if (compare) |_| std.debug.print("|-{0c:-^[1]}-|-{0c:-^[2]}-",
                                         .{'-', heads[2].len, heads[3].len});
    }
    std.debug.print("|\n", .{});

    // Print frequences
    var col: usize = 0;
    for (charset, freqs, 0..) |cp, freq, i| {
        // Codepoint is printed as ascii becouse unicode printing doesnt support width
        std.debug.print("| {0c:^[1]} | {2d:^[3].4} ",
                        .{@as(u8, @truncate(cp)), heads[0].len, freq, heads[1].len});

        if (compare) |c|
            std.debug.print("| {0d:^[1].4} | {2d:^[3].4} ",
                            .{c[i], heads[2].len, freq - c[i], heads[3].len});

        col += 1;
        if (col % columns == 0) {
            std.debug.print("|\n", .{});
        }
    }
}

/// Try to crack cesar cypher using frequency analysis
fn tryCrackManual(cmd_name: []const u8, it: *std.mem.SplitIterator(u8, .any)) void {
    _ = cmd_name;
    const file = nextArgFile(it, "encrypted file", .{.open = .{.allow_directory = false}}) orelse return;
    defer file.close(global.io);

    const letters, const freqs = englishFreqs(file);

    const top = algo.freq.sortDownIndices(f32, freqs.len, &freqs);
    const std_top = algo.freq.sortDownIndices(f32, algo.freq.englishFreqs.len, &algo.freq.englishFreqs);

    print("Plain frequency comparison:\n", .{});
    for (top, std_top) |i, si| {
        print("{u} is probably {u} (offset: {d:3}, diff: {d:.4})\n",
              .{letters[i], letters[si],
                @as(i32, letters[i]) - letters[si],
                algo.freq.englishFreqs[si] - freqs[i]});
    }
}

/// Count through to the frequency of english case-independent letters
fn englishFreqs(file: Io.File) struct{[algo.freq.englishLowercase.len]u21, [algo.freq.englishLowercase.len]f32} {
    const l = algo.freq.englishLetters;
    const total, const a = algo.freq.countInFile(global.io, file, l.len, &l);
    const il, const ia = algo.freq.toICase(l.len, &l, &a, 'a', 'A', algo.freq.englishLowercase.len);
    const freqs = algo.freq.countFreqs(il.len, total, &ia);
    return .{il, freqs};
}

/// Iterate over accaptable keys of cypher
const KeyIter = struct {
    base: usize,
    coef: usize,
    buf: [20]u8,
    algo: algo.AlgoType,

    fn nextValidCoef(coef: usize) usize {
        if (coef + 1 >= algo.opts.n_chars) return algo.opts.n_chars;
        for (coef+1..algo.opts.n_chars) |c| {
            if (std.math.gcd(c, algo.opts.n_chars) == 1)
                return c;
        }
        return algo.opts.n_chars;
    }

    pub fn init(algo_type: algo.AlgoType) ?@This() {
        return switch (algo_type) {
            .cesar, .cesar_affine => .{
                .base = 0,
                .coef = 1,
                .buf = undefined,
                .algo = algo_type,
            },
            else => null,
        };
    }
    pub fn next(it: *@This()) ?[]u8 {
        switch (it.algo) {
            .cesar_affine => {
                it.coef = nextValidCoef(it.coef);
                if (it.coef >= algo.opts.n_chars) {
                    it.coef = nextValidCoef(1);
                    it.base += 1;
                    if (it.base >= algo.opts.n_chars) return null;
                }
                return std.fmt.bufPrint(&it.buf, "{},{}", .{it.coef, it.base}) catch unreachable;
            },
            .cesar => {
                if (it.base >= algo.opts.n_chars) return null;
                it.base += 1;
                return std.fmt.bufPrint(&it.buf, "{}", .{it.base - 1}) catch unreachable;
            },
            else => unreachable,
        }
    }
};

/// Arguments: algorithm, encrypted file
fn tryCrackChiSqrInteractive(cmd_name: []const u8, it: *std.mem.SplitIterator(u8, .any)) void {
    _ = cmd_name;

    const algo_type = nextArgAlgo(it) orelse return;

    const path = nextArg(it, "encrypted file path") orelse return;
    const content = Io.Dir.cwd().readFileAlloc(global.io, path, global.gpa, .unlimited) catch |e| {
        print("Error reading file {s}: {t}\n", .{path, e});
        return;
    };
    defer global.gpa.free(content);

    tryCrackChiSqr(algo_type, content);
}

/// Brute-force attack using Chi^2 for determining key
fn tryCrackChiSqr(algo_type: algo.AlgoType, content: []const u8) void {
    var key_it = KeyIter.init(algo_type) orelse {
        print("Algorithm {t} is not supported for chi^2 cracking method\n", .{algo_type});
        return;
    };

    const wr_buf = global.gpa.alloc(u8, content.len) catch return;
    defer global.gpa.free(wr_buf);

    var best_key_buf: [20]u8 = undefined;
    var best_key_len: usize = undefined;
    var best_chi: f64 = std.math.floatMax(f64);

    const l = algo.freq.englishLetters;

    while (key_it.next()) |key| {
        var rd = Io.Reader.fixed(content);
        var wr = std.Io.Writer.Allocating.initOwnedSlice(global.gpa, wr_buf);

        _ = algo.runCryptAlgo(algo_type, .decrypt, key, &rd, &wr.writer) catch |e| {
            print("Writing to buffer failed: {t}\n", .{e});
            break;
        };

        var decr_rd = Io.Reader.fixed(wr.written());

        const total, const a = algo.freq.countLetters(&decr_rd, l.len, &l);
        const il, const ia = algo.freq.toICase(l.len, &l, &a, 'a', 'A', algo.freq.englishLowercase.len);
        var ethalon: [il.len]usize = undefined;
        for (0..ethalon.len) |i| {
            ethalon[i] = @round(@as(f64, algo.freq.englishFreqs[i]) *
                                @as(f64, @floatFromInt(total)));
        }

        const chisqr = algo.freq.chiSqr(il.len, &ia, &ethalon);
        if (chisqr < best_chi) {
            best_chi = chisqr;
            best_key_len = key.len;
            @memcpy(best_key_buf[0..key.len], key);
        }
    }
    print("Best guess key: {s} (chi^2 = {d:.4})\n", .{best_key_buf[0..best_key_len], best_chi});
}

fn nextArgCpPair(it: *std.mem.SplitIterator(u8, .any), prompt: []const u8) ?[2]u21 {
    const pair_utf8 = nextArg(it, prompt) orelse return null;
    var pair: [2]u21 = undefined;

    var utf_it = (std.unicode.Utf8View.init(pair_utf8) catch |e| {
        print("Not a valid unicode string: {t}\n", .{e});
        return null;
    }).iterator();

    var i: usize = 0;
    while (utf_it.nextCodepoint()) |cp| {
        if (i >= pair.len) {
            pair[i - 1] = cp;
        } else {
            pair[i] = cp;
            i += 1;
        }
    }
    if (i < pair.len) {
        print("Must be 2 characters\n", .{});
        return null;
    }
    return pair;
}

/// Crack using bunch of encrypted text letters correspondent to alphabet letters
/// Arguments: algorithm type, some pairs of encrypted to decrypted letter (1 for cesar, 2 for affine)
fn crackByKnownLetters(cmd_name: []const u8, it: *std.mem.SplitIterator(u8, .any)) void {
    _ = cmd_name;
    const algo_type = nextArgAlgo(it) orelse return;
    switch (algo_type) {
        .cesar => {
            const pair = nextArgCpPair(it, "encrypted-decrypted letter pair") orelse return;
            print("Key: {}\n", .{@as(i32, pair[0]) - pair[1]});
        },
        .cesar_affine => {
            const pair1 = nextArgCpPair(it, "encrypted-decrypted letter first pair") orelse return;
            const pair2 = nextArgCpPair(it, "encrypted-decrypted letter second pair") orelse return;
            if (pair1[0] < algo.opts.min_char or pair1[0] > algo.opts.max_char or
                pair1[1] < algo.opts.min_char or pair1[1] > algo.opts.max_char or
                pair2[0] < algo.opts.min_char or pair2[0] > algo.opts.max_char or
                pair2[1] < algo.opts.min_char or pair2[1] > algo.opts.max_char) {
                print("Characters are not in alphabet\n", .{});
                return;
            }
            const c1: i32 = pair1[0] - algo.opts.min_char;
            const c2: i32 = pair2[0] - algo.opts.min_char;
            const p1: i32 = pair1[1] - algo.opts.min_char;
            const p2: i32 = pair2[1] - algo.opts.min_char;

            const dc = @mod(@as(i32, c1) - @as(i32, c2), algo.opts.n_chars);
            const dp = @mod(@as(i32, p1) - @as(i32, p2), algo.opts.n_chars);

            const inv = util.inversed(dp, algo.opts.n_chars) orelse {
                print("No solution\n", .{});
                return;
            };
            const coef = @mod(dc * inv, algo.opts.n_chars);
            const base = @mod(c1 - coef * p1, algo.opts.n_chars);
            if (std.math.gcd(@as(u32, @intCast(coef)), algo.opts.n_chars) == 1) {
                print("Solution is: {},{}\n", .{coef, base});
            } else {
                print("Could not find solution\n", .{});
            }
        },
        else => {
            print("Algorithm {t} is not supported\n", .{algo_type});
        },
    }
}

/// Get index of coincedense of letters in text
fn coincidenceIndex(cmd_name: []const u8, it: *std.mem.SplitIterator(u8, .any)) void {
    _ = cmd_name;
    const file = nextArgFile(it, "file", .{.open = .{.allow_directory = false}}) orelse return;
    defer file.close(global.io);

    const ic = algo.freq.coincidenceIndex(global.io, file);

    std.debug.print("Coincedence index: {:.4}\n" ++
                        "English reference: {:.4}\n" ++
                        "Ukrainian reference: {:.4}\n" ++
                        "Random reference: {:.4}\n",
                    .{ic,
                      algo.freq.eng_coinc_index,
                      algo.freq.ukr_coinc_index,
                      algo.freq.rnd_coinc_index});
}
