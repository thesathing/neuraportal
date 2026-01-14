// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/INeuraFactory.sol";
import "./interfaces/INeuraPair.sol";
import "./interfaces/IERC20.sol";
import "./libraries/NeuraLibrary.sol";
import "./libraries/TransferHelper.sol";

contract NeuraRouter {
    address public immutable factory;
    address public immutable WANKR;

    modifier ensure(uint256 deadline) {
        require(deadline >= block.timestamp, "NeuraRouter: EXPIRED");
        _;
    }

    constructor(address _factory, address _WANKR) {
        factory = _factory;
        WANKR = _WANKR;
    }

    receive() external payable {
        assert(msg.sender == WANKR);
    }

    // **** ADD LIQUIDITY ****
    function _addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin
    ) internal returns (uint256 amountA, uint256 amountB) {
        if (INeuraFactory(factory).getPair(tokenA, tokenB) == address(0)) {
            INeuraFactory(factory).createPair(tokenA, tokenB);
        }
        (uint256 reserveA, uint256 reserveB) = NeuraLibrary.getReserves(factory, tokenA, tokenB);
        if (reserveA == 0 && reserveB == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            uint256 amountBOptimal = NeuraLibrary.quote(amountADesired, reserveA, reserveB);
            if (amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, "NeuraRouter: INSUFFICIENT_B_AMOUNT");
                (amountA, amountB) = (amountADesired, amountBOptimal);
            } else {
                uint256 amountAOptimal = NeuraLibrary.quote(amountBDesired, reserveB, reserveA);
                assert(amountAOptimal <= amountADesired);
                require(amountAOptimal >= amountAMin, "NeuraRouter: INSUFFICIENT_A_AMOUNT");
                (amountA, amountB) = (amountAOptimal, amountBDesired);
            }
        }
    }

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external ensure(deadline) returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        (amountA, amountB) = _addLiquidity(tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin);
        address pair = NeuraLibrary.pairFor(factory, tokenA, tokenB);
        TransferHelper.safeTransferFrom(tokenA, msg.sender, pair, amountA);
        TransferHelper.safeTransferFrom(tokenB, msg.sender, pair, amountB);
        liquidity = INeuraPair(pair).mint(to);
    }

    function addLiquidityANKR(
        address token,
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountANKRMin,
        address to,
        uint256 deadline
    ) external payable ensure(deadline) returns (uint256 amountToken, uint256 amountANKR, uint256 liquidity) {
        (amountToken, amountANKR) = _addLiquidity(
            token,
            WANKR,
            amountTokenDesired,
            msg.value,
            amountTokenMin,
            amountANKRMin
        );
        address pair = NeuraLibrary.pairFor(factory, token, WANKR);
        TransferHelper.safeTransferFrom(token, msg.sender, pair, amountToken);
        IWANKR(WANKR).deposit{value: amountANKR}();
        assert(IWANKR(WANKR).transfer(pair, amountANKR));
        liquidity = INeuraPair(pair).mint(to);
        if (msg.value > amountANKR) TransferHelper.safeTransferANKR(msg.sender, msg.value - amountANKR);
    }

    // **** REMOVE LIQUIDITY ****
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) public ensure(deadline) returns (uint256 amountA, uint256 amountB) {
        address pair = NeuraLibrary.pairFor(factory, tokenA, tokenB);
        INeuraPair(pair).transferFrom(msg.sender, pair, liquidity);
        (uint256 amount0, uint256 amount1) = INeuraPair(pair).burn(to);
        (address token0, ) = NeuraLibrary.sortTokens(tokenA, tokenB);
        (amountA, amountB) = tokenA == token0 ? (amount0, amount1) : (amount1, amount0);
        require(amountA >= amountAMin, "NeuraRouter: INSUFFICIENT_A_AMOUNT");
        require(amountB >= amountBMin, "NeuraRouter: INSUFFICIENT_B_AMOUNT");
    }

    function removeLiquidityANKR(
        address token,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountANKRMin,
        address to,
        uint256 deadline
    ) public ensure(deadline) returns (uint256 amountToken, uint256 amountANKR) {
        (amountToken, amountANKR) = removeLiquidity(
            token,
            WANKR,
            liquidity,
            amountTokenMin,
            amountANKRMin,
            address(this),
            deadline
        );
        TransferHelper.safeTransfer(token, to, amountToken);
        IWANKR(WANKR).withdraw(amountANKR);
        TransferHelper.safeTransferANKR(to, amountANKR);
    }

    // **** SWAP ****
    function _swap(uint256[] memory amounts, address[] memory path, address _to) internal {
        for (uint256 i; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0, ) = NeuraLibrary.sortTokens(input, output);
            uint256 amountOut = amounts[i + 1];
            (uint256 amount0Out, uint256 amount1Out) = input == token0
                ? (uint256(0), amountOut)
                : (amountOut, uint256(0));
            address to = i < path.length - 2 ? NeuraLibrary.pairFor(factory, output, path[i + 2]) : _to;
            INeuraPair(NeuraLibrary.pairFor(factory, input, output)).swap(amount0Out, amount1Out, to, new bytes(0));
        }
    }

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external ensure(deadline) returns (uint256[] memory amounts) {
        amounts = NeuraLibrary.getAmountsOut(factory, amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "NeuraRouter: INSUFFICIENT_OUTPUT_AMOUNT");
        TransferHelper.safeTransferFrom(path[0], msg.sender, NeuraLibrary.pairFor(factory, path[0], path[1]), amounts[0]);
        _swap(amounts, path, to);
    }

    function swapTokensForExactTokens(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external ensure(deadline) returns (uint256[] memory amounts) {
        amounts = NeuraLibrary.getAmountsIn(factory, amountOut, path);
        require(amounts[0] <= amountInMax, "NeuraRouter: EXCESSIVE_INPUT_AMOUNT");
        TransferHelper.safeTransferFrom(path[0], msg.sender, NeuraLibrary.pairFor(factory, path[0], path[1]), amounts[0]);
        _swap(amounts, path, to);
    }

    function swapExactANKRForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable ensure(deadline) returns (uint256[] memory amounts) {
        require(path[0] == WANKR, "NeuraRouter: INVALID_PATH");
        amounts = NeuraLibrary.getAmountsOut(factory, msg.value, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "NeuraRouter: INSUFFICIENT_OUTPUT_AMOUNT");
        IWANKR(WANKR).deposit{value: amounts[0]}();
        assert(IWANKR(WANKR).transfer(NeuraLibrary.pairFor(factory, path[0], path[1]), amounts[0]));
        _swap(amounts, path, to);
    }

    function swapTokensForExactANKR(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external ensure(deadline) returns (uint256[] memory amounts) {
        require(path[path.length - 1] == WANKR, "NeuraRouter: INVALID_PATH");
        amounts = NeuraLibrary.getAmountsIn(factory, amountOut, path);
        require(amounts[0] <= amountInMax, "NeuraRouter: EXCESSIVE_INPUT_AMOUNT");
        TransferHelper.safeTransferFrom(path[0], msg.sender, NeuraLibrary.pairFor(factory, path[0], path[1]), amounts[0]);
        _swap(amounts, path, address(this));
        IWANKR(WANKR).withdraw(amounts[amounts.length - 1]);
        TransferHelper.safeTransferANKR(to, amounts[amounts.length - 1]);
    }

    function swapExactTokensForANKR(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external ensure(deadline) returns (uint256[] memory amounts) {
        require(path[path.length - 1] == WANKR, "NeuraRouter: INVALID_PATH");
        amounts = NeuraLibrary.getAmountsOut(factory, amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "NeuraRouter: INSUFFICIENT_OUTPUT_AMOUNT");
        TransferHelper.safeTransferFrom(path[0], msg.sender, NeuraLibrary.pairFor(factory, path[0], path[1]), amounts[0]);
        _swap(amounts, path, address(this));
        IWANKR(WANKR).withdraw(amounts[amounts.length - 1]);
        TransferHelper.safeTransferANKR(to, amounts[amounts.length - 1]);
    }

    function swapANKRForExactTokens(
        uint256 amountOut,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable ensure(deadline) returns (uint256[] memory amounts) {
        require(path[0] == WANKR, "NeuraRouter: INVALID_PATH");
        amounts = NeuraLibrary.getAmountsIn(factory, amountOut, path);
        require(amounts[0] <= msg.value, "NeuraRouter: EXCESSIVE_INPUT_AMOUNT");
        IWANKR(WANKR).deposit{value: amounts[0]}();
        assert(IWANKR(WANKR).transfer(NeuraLibrary.pairFor(factory, path[0], path[1]), amounts[0]));
        _swap(amounts, path, to);
        if (msg.value > amounts[0]) TransferHelper.safeTransferANKR(msg.sender, msg.value - amounts[0]);
    }

    // **** LIBRARY FUNCTIONS ****
    function quote(uint256 amountA, uint256 reserveA, uint256 reserveB) public pure returns (uint256 amountB) {
        return NeuraLibrary.quote(amountA, reserveA, reserveB);
    }

    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256 amountOut) {
        return NeuraLibrary.getAmountOut(amountIn, reserveIn, reserveOut);
    }

    function getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256 amountIn) {
        return NeuraLibrary.getAmountIn(amountOut, reserveIn, reserveOut);
    }

    function getAmountsOut(uint256 amountIn, address[] memory path) public view returns (uint256[] memory amounts) {
        return NeuraLibrary.getAmountsOut(factory, amountIn, path);
    }

    function getAmountsIn(uint256 amountOut, address[] memory path) public view returns (uint256[] memory amounts) {
        return NeuraLibrary.getAmountsIn(factory, amountOut, path);
    }
}

interface IWANKR {
    function deposit() external payable;
    function transfer(address to, uint256 value) external returns (bool);
    function withdraw(uint256) external;
}
